import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import ApiMessages from "@/helpers/ApiMessages";
import ApiResponse from "@/helpers/ApiResponse";
import AppLogger from "@/helpers/AppLoggger";

const RegisterSchema = z
  .object({
    first_name: z
      .string({ required_error: "First name is required" })
      .min(1, "First name cannot be empty")
      .max(50, "First name is too long")
      .trim(),
    last_name: z
      .string({ required_error: "Last name is required" })
      .min(1, "Last name cannot be empty")
      .max(50, "Last name is too long")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email cannot be empty")
      .email("Invalid email format")
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm_password: z
      .string({ required_error: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Attaches the error to confirm_password field
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    AppLogger("Register body is:", body);

    // 1. Zod Safe Parsing
    const validation = RegisterSchema.safeParse(body);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return ApiResponse(
        400,
        ApiMessages.validation?.invalidData || "Validation failed",
        formattedErrors
      );
    }

    const { first_name, last_name, email, password } = validation.data;

    // 2. Check for Existing User
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return ApiResponse(
        409,
        ApiMessages.validation.userAlreadyExists,
        null
      );
    }

    // 3. Hash Password & Save User
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Remove Sensitive Fields before returning
    const { password: _, ...safeUser } = user;

    return ApiResponse(
      201,
      ApiMessages.success.userCreated,
      safeUser
    );
  } catch (error) {
    AppLogger("Error during registration:", error);
    return ApiResponse(
      500,
      error instanceof Error ? error.message : ApiMessages.error?.internalError || "Internal Server Error",
      null
    );
  }
}