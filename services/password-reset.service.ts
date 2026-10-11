import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getAuthEnvironment } from "@/lib/env";
import {
  generateOtp,
  generateResetToken,
  hashOtp,
  hashResetToken,
  verifyOtp,
  verifyResetToken,
} from "@/lib/otp";
import {
  sendPasswordChangedConfirmation,
  sendPasswordResetOtp,
} from "@/lib/mailer";
import { ApiError } from "@/lib/api-response";
import { enforcePasswordResetRateLimit } from "@/lib/rate-limit";

const OTP_LIFETIME_MS = 10 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000;
const INVALID_OTP_MESSAGE = "The code is invalid or has expired.";
const INVALID_RESET_TOKEN_MESSAGE =
  "The reset link is invalid or has expired.";

export async function requestPasswordReset(email: string, ip: string) {
  await enforcePasswordResetRateLimit("forgot", email, ip);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  let otpRecordId: number | undefined;
  try {
    const env = getAuthEnvironment();
    const otp = generateOtp();
    const createdAt = new Date();
    const otpRecord = await prisma.$transaction(async (transaction) => {
      await transaction.passwordResetOtp.updateMany({
        where: {
          userId: user.id,
          purpose: "PASSWORD_RESET",
          usedAt: null,
        },
        data: { usedAt: createdAt },
      });

      return transaction.passwordResetOtp.create({
        data: {
          userId: user.id,
          otpHash: hashOtp(otp, env.OTP_HMAC_SECRET),
          purpose: "PASSWORD_RESET",
          expiresAt: new Date(createdAt.getTime() + OTP_LIFETIME_MS),
        },
        select: { id: true },
      });
    });
    otpRecordId = otpRecord.id;

    await sendPasswordResetOtp(email, otp);
  } catch (error) {
    console.error("[password-reset] OTP issuance failed.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    if (otpRecordId !== undefined) {
      try {
        await prisma.passwordResetOtp.deleteMany({
          where: { id: otpRecordId, usedAt: null },
        });
      } catch {
        console.error("[password-reset] OTP cleanup failed.");
      }
    }
  }
}

export async function verifyPasswordResetOtp(
  email: string,
  otp: string,
  ip: string,
  now = new Date(),
): Promise<string> {
  await enforcePasswordResetRateLimit("verify", email, ip);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(INVALID_OTP_MESSAGE, 401);
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      verifiedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    !record ||
    record.expiresAt <= now ||
    record.attempts >= 5 ||
    !verifyOtp(otp, record.otpHash, getAuthEnvironment().OTP_HMAC_SECRET)
  ) {
    if (record && record.expiresAt > now && record.attempts < 5) {
      await incrementFailedAttempt(record.id, now);
    }
    throw new ApiError(INVALID_OTP_MESSAGE, 401);
  }

  const env = getAuthEnvironment();
  const resetToken = generateResetToken();
  const claim = await prisma.passwordResetOtp.updateMany({
    where: {
      id: record.id,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      verifiedAt: null,
      expiresAt: { gt: now },
      attempts: { lt: 5 },
    },
    data: {
      verifiedAt: now,
      resetTokenHash: hashResetToken(resetToken, env.OTP_HMAC_SECRET),
      resetTokenExpiresAt: new Date(now.getTime() + RESET_TOKEN_LIFETIME_MS),
    },
  });

  if (claim.count !== 1) {
    throw new ApiError(INVALID_OTP_MESSAGE, 401);
  }

  return resetToken;
}

export async function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string,
  ip: string,
  now = new Date(),
): Promise<void> {
  await enforcePasswordResetRateLimit("reset", email, ip);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(INVALID_RESET_TOKEN_MESSAGE, 401);
  }

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      userId: user.id,
      purpose: "PASSWORD_RESET",
      verifiedAt: { not: null },
      usedAt: null,
      resetTokenExpiresAt: { gt: now },
      resetTokenHash: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  const secret = getAuthEnvironment().OTP_HMAC_SECRET;
  if (
    !record?.resetTokenHash ||
    !verifyResetToken(resetToken, record.resetTokenHash, secret)
  ) {
    throw new ApiError(INVALID_RESET_TOKEN_MESSAGE, 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (transaction) => {
    const claimed = await transaction.passwordResetOtp.updateMany({
      where: {
        id: record.id,
        resetTokenHash: record.resetTokenHash,
        verifiedAt: { not: null },
        usedAt: null,
        resetTokenExpiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claimed.count !== 1) {
      throw new ApiError(INVALID_RESET_TOKEN_MESSAGE, 401);
    }

    await transaction.user.update({
      where: { id: user.id },
      data: {
        password: passwordHash,
        authVersion: { increment: 1 },
      },
    });

    await transaction.passwordResetOtp.deleteMany({
      where: { userId: user.id, id: { not: record.id } },
    });
  });

  try {
    await sendPasswordChangedConfirmation(email);
  } catch {
    console.error("[password-reset] Password-change confirmation email failed.");
  }
}

export async function cleanupExpiredPasswordResetOtps(
  now = new Date(),
): Promise<number> {
  const retentionCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const result = await prisma.passwordResetOtp.deleteMany({
    where: {
      OR: [
        { usedAt: { lt: retentionCutoff } },
        {
          expiresAt: { lt: now },
          resetTokenExpiresAt: null,
        },
        {
          expiresAt: { lt: now },
          resetTokenExpiresAt: { lt: now },
        },
      ],
    },
  });

  return result.count;
}

async function incrementFailedAttempt(id: number, now: Date): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const attempt = await transaction.passwordResetOtp.updateMany({
      where: {
        id,
        usedAt: null,
        verifiedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: 5 },
      },
      data: { attempts: { increment: 1 } },
    });

    if (attempt.count === 0) {
      return;
    }

    await transaction.passwordResetOtp.updateMany({
      where: {
        id,
        usedAt: null,
        verifiedAt: null,
        attempts: { gte: 5 },
      },
      data: { usedAt: now },
    });
  });
}
