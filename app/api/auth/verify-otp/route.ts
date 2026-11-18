import { NextRequest } from "next/server";
import ApiResponse from "@/helpers/ApiResponse";
import { getClientIp, handleApiError } from "@/lib/api-response";
import { validateJsonRequest } from "@/lib/validate-request";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { verifyPasswordResetOtp } from "@/services/password-reset.service";

export async function POST(request: NextRequest) {
  try {
    const validation = await validateJsonRequest(request, verifyOtpSchema);
    if (!validation.success) {
      return validation.response;
    }

    const resetToken = await verifyPasswordResetOtp(
      validation.data.email,
      validation.data.otp,
      getClientIp(request),
    );

    return ApiResponse(200, "The code was verified.", { resetToken });
  } catch (error) {
    return handleApiError(error);
  }
}
