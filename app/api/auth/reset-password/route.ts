import { NextRequest } from "next/server";
import ApiResponse from "@/helpers/ApiResponse";
import { getClientIp, handleApiError } from "@/lib/api-response";
import { validateJsonRequest } from "@/lib/validate-request";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { resetPassword } from "@/services/password-reset.service";

export async function POST(request: NextRequest) {
  try {
    const validation = await validateJsonRequest(request, resetPasswordSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { email, resetToken, newPassword } = validation.data;
    await resetPassword(email, resetToken, newPassword, getClientIp(request));

    return ApiResponse(200, "Your password has been reset.");
  } catch (error) {
    return handleApiError(error);
  }
}
