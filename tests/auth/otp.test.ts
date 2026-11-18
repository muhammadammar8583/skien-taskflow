import { describe, expect, it } from "vitest";
import {
  generateOtp,
  generateResetToken,
  hashOtp,
  hashResetToken,
  verifyOtp,
  verifyResetToken,
} from "@/lib/otp";

const secret = "test-secret-that-is-long-enough-for-hmac";

describe("OTP utilities", () => {
  it("generates six-digit OTPs including leading zeroes", () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
  });

  it("stores only comparable HMAC hashes and checks them in constant time", () => {
    const hash = hashOtp("012345", secret);

    expect(hash).toMatch(/^[a-f\d]{64}$/);
    expect(hash).not.toContain("012345");
    expect(verifyOtp("012345", hash, secret)).toBe(true);
    expect(verifyOtp("012346", hash, secret)).toBe(false);
    expect(verifyOtp("12345", hash, secret)).toBe(false);
    expect(verifyOtp("012345", "not-a-hash", secret)).toBe(false);
  });

  it("generates opaque reset tokens and verifies their HMACs", () => {
    const token = generateResetToken();
    const hash = hashResetToken(token, secret);

    expect(token).toHaveLength(43);
    expect(hash).not.toContain(token);
    expect(verifyResetToken(token, hash, secret)).toBe(true);
    expect(verifyResetToken(`${token}x`, hash, secret)).toBe(false);
  });
});
