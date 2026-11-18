import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import ApiMessages from "@/helpers/ApiMessages";
import ApiResponse from "@/helpers/ApiResponse";
import AppLogger from "@/helpers/AppLoggger";

export async function POST(request: Request) {
  // Implementation for verifying OTP
  const body = await request.json();
  const { email, otp } = body;
  if (!email || !otp) {
    return ApiResponse(400, 'Email and otp are required', null)
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

   if (!user) {
    return ApiResponse(404, ApiMessages.error.userNotFound, null);
   }
   prisma.passwordResetOtp.findUnique({
    where: {  }
   }) 
}