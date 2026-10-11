import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuthConfigurationError,
  getAuthEnvironment,
} from "@/lib/env";

describe("authentication environment validation", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts blank Upstash values as unset for development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("OTP_HMAC_SECRET", "otp-hmac-secret-with-at-least-32-characters");
    vi.stubEnv("JWT_SECRET", "jwt-secret-with-at-least-32-characters");
    vi.stubEnv("SMTP_HOST", "smtp.gmail.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "sender@gmail.com");
    vi.stubEnv("SMTP_PASSWORD", "gmail-app-password");
    vi.stubEnv("SMTP_FROM", "sender@gmail.com");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    const environment = getAuthEnvironment();

    expect(environment.UPSTASH_REDIS_REST_URL).toBeUndefined();
    expect(environment.UPSTASH_REDIS_REST_TOKEN).toBeUndefined();
  });

  it("reports invalid environment variable names without their values", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("OTP_HMAC_SECRET", "too-short-secret");
    vi.stubEnv("JWT_SECRET", "also-too-short");
    vi.stubEnv("SMTP_HOST", "smtp.gmail.com");
    vi.stubEnv("SMTP_PORT", "587");
    vi.stubEnv("SMTP_USER", "sender@gmail.com");
    vi.stubEnv("SMTP_PASSWORD", "gmail-app-password");
    vi.stubEnv("SMTP_FROM", "sender@gmail.com");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");

    try {
      getAuthEnvironment();
      expect.fail("Expected invalid auth configuration.");
    } catch (error) {
      expect(error).toBeInstanceOf(AuthConfigurationError);
      expect((error as AuthConfigurationError).invalidVariables).toEqual(
        expect.arrayContaining(["OTP_HMAC_SECRET", "JWT_SECRET"]),
      );
    }
  });
});
