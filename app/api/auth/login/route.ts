import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ApiMessages from "@/helpers/ApiMessages";
import ApiResponse from "@/helpers/ApiResponse";
import AppLogger from "@/helpers/AppLoggger";
import * as jose from 'jose';
import * as z from 'zod';
import bcrypt from 'bcrypt';

const LoginSchema = z.object({
    email: z
        .string({ required_error: ApiMessages.validation.emailRequired })
        .min(1, ApiMessages.validation.emailEmpty)
        .email(ApiMessages.validation.invalidEmail)
        .trim()
        .toLowerCase(),
    password: z
        .string({ required_error: ApiMessages.validation.passwordRequired })
        .min(1, ApiMessages.validation.passwordEmpty)
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        AppLogger('Login body is:', body);

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
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ id: user.id, email: user.email })
            .setExpirationTime('1d')
            .setIssuedAt()
            .setProtectedHeader({ alg })
            .sign(secret);

        AppLogger('Token generated for user:', user.email);

        const { password: _, ...userWithoutPassword } = user;

        const LoginResponse = {
            user: userWithoutPassword,
            token: token
        };

        return ApiResponse(200, ApiMessages.success.userLoggedIn, LoginResponse);
    } catch (error) {
        AppLogger('Error during login:', error);
        return ApiResponse(500, error instanceof Error ? error.message : ApiMessages.error.internalError, null);
    }
}