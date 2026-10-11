import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  consumeRateLimit,
  resetInMemoryRateLimitsForTests,
} from "@/lib/rate-limit";

describe("development rate limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-11T00:00:00.000Z"));
    resetInMemoryRateLimitsForTests();
    vi.stubEnv("NODE_ENV", "test");
    process.env.OTP_HMAC_SECRET = "otp-hmac-secret-with-at-least-32-characters";
    process.env.JWT_SECRET = "jwt-secret-with-at-least-32-characters";
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "test-user";
    process.env.SMTP_PASSWORD = "test-password";
    process.env.SMTP_FROM = "no-reply@example.com";
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("enforces the 60-second email cooldown and allows a request after it", async () => {
    const rule = {
      name: "forgot:email:cooldown",
      identifier: "user@example.com",
      limit: 1,
      windowSeconds: 60,
    };

    await expect(consumeRateLimit(rule)).resolves.toBe(true);
    await expect(consumeRateLimit(rule)).resolves.toBe(false);

    vi.advanceTimersByTime(60_001);
    await expect(consumeRateLimit(rule)).resolves.toBe(true);
  });

  it("limits forgot-password requests to five per email per hour", async () => {
    const rule = {
      name: "forgot:email:hourly",
      identifier: "user@example.com",
      limit: 5,
      windowSeconds: 60 * 60,
    };

    for (let index = 0; index < 5; index += 1) {
      await expect(consumeRateLimit(rule)).resolves.toBe(true);
    }

    await expect(consumeRateLimit(rule)).resolves.toBe(false);
  });
});
