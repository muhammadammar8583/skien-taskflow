import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

const SHA256_HEX_LENGTH = 64;

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashOtp(otp: string, secret: string): string {
  return createHmac("sha256", secret).update(otp).digest("hex");
}

export function hashResetToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function verifyOtp(otp: string, expectedHash: string, secret: string): boolean {
  if (!/^\d{6}$/.test(otp)) {
    return false;
  }

  return verifyHash(hashOtp(otp, secret), expectedHash);
}

export function verifyResetToken(
  token: string,
  expectedHash: string,
  secret: string,
): boolean {
  return verifyHash(hashResetToken(token, secret), expectedHash);
}

function verifyHash(actualHash: string, expectedHash: string): boolean {
  if (
    expectedHash.length !== SHA256_HEX_LENGTH ||
    !/^[a-f\d]{64}$/i.test(expectedHash)
  ) {
    return false;
  }

  const actual = Buffer.from(actualHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
