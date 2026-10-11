import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ApiMessages from "@/helpers/ApiMessages";
import ApiResponse from "@/helpers/ApiResponse";
import AppLogger from "@/helpers/AppLoggger";
import * as jose from 'jose';
import * as z from 'zod/v3';
import bcrypt from 'bcrypt';
import { getJwtSecret } from "@/lib/env";

const LoginSchema = z.object({
    email: z
        .string({ required_error: ApiMessages.validation.emailRequired })
        .trim()
        .toLowerCase()
        .min(1, ApiMessages.validation.emailEmpty)
        .email(ApiMessages.validation.invalidEmail),
    password: z
        .string({ required_error: ApiMessages.validation.passwordRequired })
        .min(1, ApiMessages.validation.passwordEmpty)
});

export async function POST(request: NextRequest) {
    try {
        let body: unknown;
        try {
            body = await request.json();
        } catch {
            return ApiResponse(400, ApiMessages.validation.invalidInput, null);
        }

        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            const formattedErrors = validation.error.flatten().fieldErrors;
            return ApiResponse(400, ApiMessages.validation.invalidInput, formattedErrors);
        }

        const { email, password } = validation.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return ApiResponse(404, ApiMessages.error.userNotFound, null);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return ApiResponse(401, ApiMessages.validation.invalidCredentials || "Invalid password", null);
        }

        const alg = 'HS256';
        const secret = new TextEncoder().encode(getJwtSecret());
        const token = await new jose.SignJWT({
            id: user.id,
            email: user.email,
            authVersion: user.authVersion,
        })
            .setExpirationTime('1d')
            .setIssuedAt()
            .setProtectedHeader({ alg })
            .sign(secret);

        AppLogger.info('Authentication token issued.');

        const { password: _, ...userWithoutPassword } = user;

        const LoginResponse = {
            user: userWithoutPassword,
        };

        const response = ApiResponse(200, ApiMessages.success.userLoggedIn, LoginResponse);
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        AppLogger('Error during login:', error);
        return ApiResponse(500, ApiMessages.error.internalError, null);
    }
}