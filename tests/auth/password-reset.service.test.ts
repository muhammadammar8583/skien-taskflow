import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-response";
import { hashOtp, hashResetToken } from "@/lib/otp";

const mocks = vi.hoisted(() => {
  const transaction = {
    passwordResetOtp: {
      updateMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  };
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passwordResetOtp: {
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return {
    prisma,
    transaction,
    enforcePasswordResetRateLimit: vi.fn(),
    sendPasswordResetOtp: vi.fn(),
    sendPasswordChangedConfirmation: vi.fn(),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/rate-limit", () => ({
  enforcePasswordResetRateLimit: mocks.enforcePasswordResetRateLimit,
}));
vi.mock("@/lib/env", () => ({
  getAuthEnvironment: () => ({
    OTP_HMAC_SECRET: "test-secret-that-is-long-enough-for-hmac",
  }),
}));
vi.mock("@/lib/mailer", () => ({
  sendPasswordResetOtp: mocks.sendPasswordResetOtp,
  sendPasswordChangedConfirmation: mocks.sendPasswordChangedConfirmation,
}));
vi.mock("bcrypt", () => ({
  default: { hash: vi.fn().mockResolvedValue("new-password-hash") },
}));

import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetOtp,
} from "@/services/password-reset.service";

const secret = "test-secret-that-is-long-enough-for-hmac";
const now = new Date("2026-10-11T00:00:00.000Z");

function makeOtpRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 41,
    userId: 7,
    purpose: "PASSWORD_RESET",
    otpHash: hashOtp("012345", secret),
    expiresAt: new Date(now.getTime() + 60_000),
    attempts: 0,
    verifiedAt: null,
    usedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    createdAt: now,
    ...overrides,
  };
}

describe("password reset service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(
      (callback: (transaction: typeof mocks.transaction) => Promise<unknown>) =>
        callback(mocks.transaction),
    );
    mocks.prisma.user.findUnique.mockResolvedValue({ id: 7 });
    mocks.enforcePasswordResetRateLimit.mockResolvedValue(undefined);
  });

  it("rejects an expired OTP without accepting it", async () => {
    mocks.prisma.passwordResetOtp.findFirst.mockResolvedValue(
      makeOtpRecord({ expiresAt: new Date(now.getTime() - 1) }),
    );

    await expect(
      verifyPasswordResetOtp("user@example.com", "012345", "127.0.0.1", now),
    ).rejects.toMatchObject({ status: 401 });
    expect(mocks.prisma.passwordResetOtp.updateMany).not.toHaveBeenCalled();
  });

  it("invalidates an OTP on its fifth failed attempt", async () => {
    mocks.prisma.passwordResetOtp.findFirst.mockResolvedValue(
      makeOtpRecord({ attempts: 4 }),
    );
    mocks.transaction.passwordResetOtp.updateMany.mockResolvedValue({
      count: 1,
    });

    await expect(
      verifyPasswordResetOtp("user@example.com", "999999", "127.0.0.1", now),
    ).rejects.toMatchObject({ status: 401 });

    expect(mocks.transaction.passwordResetOtp.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ attempts: { gte: 5 } }),
        data: { usedAt: now },
      }),
    );
  });

  it("does not allow the same OTP to be verified twice", async () => {
    const record = makeOtpRecord();
    mocks.prisma.passwordResetOtp.findFirst.mockImplementation(async () =>
      record.verifiedAt === null ? record : null,
    );
    mocks.prisma.passwordResetOtp.updateMany.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(record, data);
        return { count: 1 };
      },
    );

    const token = await verifyPasswordResetOtp(
      "user@example.com",
      "012345",
      "127.0.0.1",
      now,
    );

    expect(token).toBeTruthy();
    await expect(
      verifyPasswordResetOtp("user@example.com", "012345", "127.0.0.1", now),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("allows a cooldown rejection before looking up or emailing an account", async () => {
    mocks.enforcePasswordResetRateLimit.mockRejectedValue(
      new ApiError("Too many requests. Please try again later.", 429),
    );

    await expect(
      requestPasswordReset("user@example.com", "127.0.0.1"),
    ).rejects.toMatchObject({ status: 429 });
    expect(mocks.prisma.user.findUnique).not.toHaveBeenCalled();
    expect(mocks.sendPasswordResetOtp).not.toHaveBeenCalled();
  });

  it("accepts a reset token once and rejects its reuse", async () => {
    const token = "single-use-reset-token";
    const record = makeOtpRecord({
      verifiedAt: now,
      resetTokenHash: hashResetToken(token, secret),
      resetTokenExpiresAt: new Date(now.getTime() + 60_000),
    });
    mocks.prisma.passwordResetOtp.findFirst.mockImplementation(async () =>
      record.usedAt === null ? record : null,
    );
    mocks.transaction.passwordResetOtp.updateMany.mockImplementation(
      async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(record, data);
        return { count: 1 };
      },
    );

    await resetPassword(
      "user@example.com",
      token,
      "Stronger!Password2026",
      "127.0.0.1",
      now,
    );

    await expect(
      resetPassword(
        "user@example.com",
        token,
        "Stronger!Password2026",
        "127.0.0.1",
        now,
      ),
    ).rejects.toMatchObject({ status: 401 });
    expect(mocks.transaction.user.update).toHaveBeenCalledTimes(1);
  });
});
