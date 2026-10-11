import { NextRequest } from "next/server";
import ApiResponse from "@/helpers/ApiResponse";
import { getClientIp, handleApiError } from "@/lib/api-response";
import { validateJsonRequest } from "@/lib/validate-request";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { requestPasswordReset } from "@/services/password-reset.service";

export async function POST(request: NextRequest) {
	const startedAt = Date.now();

	try {
		const validation = await validateJsonRequest(request, forgotPasswordSchema);
		if (!validation.success) {
			return validation.response;
		}

		await requestPasswordReset(validation.data.email, getClientIp(request));
		return ApiResponse(
			200,
			"If an account exists, an OTP has been sent",
		);
	} catch (error) {
		return handleApiError(error);
	} finally {
		const remainingDelay = 350 - (Date.now() - startedAt);
		if (remainingDelay > 0) {
			await new Promise((resolve) => setTimeout(resolve, remainingDelay));
		}
	}
}
