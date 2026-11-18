import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import ApiMessages from "@/helpers/ApiMessages";
import ApiResponse from "@/helpers/ApiResponse";
import AppLogger from "@/helpers/AppLoggger";
import * as z from "zod";
import sendEmail from "@/utils/sendEmail";
import crypto from "node:crypto";

const ForgotPasswordSchema = z.object({
    email: z
        .string({ required_error: ApiMessages.validation.emailRequired })
        .min(1, ApiMessages.validation.emailEmpty)
        .email(ApiMessages.validation.invalidEmail)
        .trim()
        .toLowerCase(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = ForgotPasswordSchema.safeParse(body);
        if (!validation.success) {
            const formattedErrors = validation.error.flatten().fieldErrors;
            return ApiResponse(400, ApiMessages.validation.invalidInput, formattedErrors);
        }

        const { email } = validation.data;
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true },
        });

        if (!user) {
            return ApiResponse(404, ApiMessages.error.userNotFound, null);
        }

        const hmacSecret = process.env.OTP_HMAC_SECRET;
        if (!hmacSecret || Buffer.byteLength(hmacSecret, "utf8") < 32) {
            AppLogger("OTP_HMAC_SECRET must be configured with at least 32 bytes.");
            return ApiResponse(500, ApiMessages.error.internalError, null);
        }

        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = crypto
            .createHmac("sha256", hmacSecret)
            .update(`password-reset:${user.id}:${otp}`)
            .digest("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.passwordResetOtp.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                otpHash,
                expiresAt,
            },
            update: {
                otpHash,
                expiresAt,
                attempts: 0,
                createdAt: new Date(),
            },
        });

        await sendEmail({
            email: user.email,
            subject: "Password Reset OTP",
            message: `Your OTP for password reset is: ${otp}`,
        });

        return ApiResponse(200, ApiMessages.success.otpSent, null);
    } catch (error) {
        AppLogger("Error during forgot password request:", error);
        return ApiResponse(500, ApiMessages.error.internalError, null);
    }
}
