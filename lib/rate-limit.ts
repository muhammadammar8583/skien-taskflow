import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createHash } from "node:crypto";
import { ApiError } from "@/lib/api-response";
import { getAuthEnvironment } from "@/lib/env";

type RateLimitRule = {
  name: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
};

type MemoryBucket = {
  timestamps: number[];
};

const memoryBuckets = new Map<string, MemoryBucket>();
const MAX_MEMORY_BUCKETS = 10_000;
const upstashLimiters = new Map<string, Ratelimit>();
let redis: Redis | undefined;

export async function enforcePasswordResetRateLimit(
  action: "forgot" | "verify" | "reset",
  email: string,
  ip: string,
): Promise<void> {
  const rules: RateLimitRule[] = [
    {
      name: `${action}:ip`,
      identifier: ip,
      limit: 30,
      windowSeconds: 60 * 60,
    },
  ];

  if (action === "forgot") {
    rules.push(
      {
        name: "forgot:email:cooldown",
        identifier: email,
        limit: 1,
        windowSeconds: 60,
      },
      {
        name: "forgot:email:hourly",
        identifier: email,
        limit: 5,
        windowSeconds: 60 * 60,
      },
    );
  } else {
    rules.push({
      name: `${action}:email`,
      identifier: email,
      limit: 10,
      windowSeconds: 60 * 60,
    });
  }

  const results = await Promise.all(rules.map(consumeRateLimit));
  if (results.some((allowed) => !allowed)) {
    throw new ApiError("Too many requests. Please try again later.", 429);
  }
}

export async function consumeRateLimit(rule: RateLimitRule): Promise<boolean> {
  const env = getAuthEnvironment();
  const identifier = createHash("sha256")
    .update(rule.identifier)
    .digest("hex");

  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    redis ??= Redis.fromEnv();
    const limiter = getUpstashLimiter(rule, redis);
    const result = await limiter.limit(identifier);
    return result.success;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Production rate limiting requires Upstash Redis.");
  }

  return consumeInMemory(rule, identifier);
}

function getUpstashLimiter(rule: RateLimitRule, store: Redis): Ratelimit {
  const key = `${rule.name}:${rule.limit}:${rule.windowSeconds}`;
  let limiter = upstashLimiters.get(key);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: store,
      limiter: Ratelimit.slidingWindow(rule.limit, `${rule.windowSeconds} s`),
      prefix: `skien:auth:${rule.name}`,
    });
    upstashLimiters.set(key, limiter);
  }

  return limiter;
}

function consumeInMemory(rule: RateLimitRule, identifier: string): boolean {
  const now = Date.now();
  const bucketKey = `${rule.name}:${rule.limit}:${rule.windowSeconds}:${identifier}`;
  const cutoff = now - rule.windowSeconds * 1000;
  const existing = memoryBuckets.get(bucketKey);
  const bucket = existing ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => timestamp > cutoff);

  if (bucket.timestamps.length >= rule.limit) {
    memoryBuckets.set(bucketKey, bucket);
    return false;
  }

  bucket.timestamps.push(now);
  memoryBuckets.set(bucketKey, bucket);
  pruneMemoryBuckets(now);
  return true;
}

function pruneMemoryBuckets(now: number): void {
  if (memoryBuckets.size <= MAX_MEMORY_BUCKETS) {
    return;
  }

  for (const [key, bucket] of memoryBuckets) {
    if (bucket.timestamps.every((timestamp) => timestamp <= now - 60 * 60 * 1000)) {
      memoryBuckets.delete(key);
    }
  }

  while (memoryBuckets.size > MAX_MEMORY_BUCKETS) {
    const oldestKey = memoryBuckets.keys().next().value;
    if (oldestKey === undefined) {
      break;
    }
    memoryBuckets.delete(oldestKey);
  }
}

export function resetInMemoryRateLimitsForTests(): void {
  memoryBuckets.clear();
}
