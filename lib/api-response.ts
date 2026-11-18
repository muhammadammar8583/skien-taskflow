import ApiResponse from "@/helpers/ApiResponse";
import { AuthConfigurationError } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 401 | 429,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return ApiResponse(error.status, error.message);
  }

  if (error instanceof AuthConfigurationError) {
    console.error("[password-reset] Invalid authentication configuration.", {
      invalidVariables: error.invalidVariables,
    });
    return ApiResponse(500, "An unexpected error occurred.");
  }

  console.error("[password-reset] Request failed.", {
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  return ApiResponse(500, "An unexpected error occurred.");
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = realIp ?? forwardedFor?.split(",")[0]?.trim();

  return ip && ip.length <= 64 ? ip : "unknown";
}
