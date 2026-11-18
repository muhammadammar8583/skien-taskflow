import { z } from "zod";

export class AuthConfigurationError extends Error {
  constructor(readonly invalidVariables: string[]) {
    super("Authentication environment configuration is invalid.");
    this.name = "AuthConfigurationError";
  }
}

const optionalRedisUrlSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const optionalRedisTokenSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const authEnvironmentSchema = z.object({
  OTP_HMAC_SECRET: z.string().min(19),
  JWT_SECRET: z.string().min(16),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM: z.string().email(),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  UPSTASH_REDIS_REST_URL: optionalRedisUrlSchema,
  UPSTASH_REDIS_REST_TOKEN: optionalRedisTokenSchema,
}).refine(
  (env) =>
    (env.UPSTASH_REDIS_REST_URL === undefined) ===
    (env.UPSTASH_REDIS_REST_TOKEN === undefined),
  "Both Upstash Redis environment variables must be configured together.",
).refine(
  (env) => env.OTP_HMAC_SECRET !== env.JWT_SECRET,
  "OTP_HMAC_SECRET and JWT_SECRET must be different.",
);

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export function getAuthEnvironment(): AuthEnvironment {
  const result = authEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    const invalidVariables = [
      ...new Set(result.error.issues.map((issue) => String(issue.path[0]))),
    ];
    throw new AuthConfigurationError(invalidVariables);
  }

  if (process.env.NODE_ENV === "production") {
    const hasRedisConfiguration =
      result.data.UPSTASH_REDIS_REST_URL !== undefined &&
      result.data.UPSTASH_REDIS_REST_TOKEN !== undefined;

    if (!hasRedisConfiguration) {
      throw new AuthConfigurationError([
        "UPSTASH_REDIS_REST_URL",
        "UPSTASH_REDIS_REST_TOKEN",
      ]);
    }
  }

  return result.data;
}

export function getJwtSecret(): string {
  const result = z.string().min(16).safeParse(process.env.JWT_SECRET);
  if (!result.success) {
    throw new AuthConfigurationError(["JWT_SECRET"]);
  }
  return result.data;
}
