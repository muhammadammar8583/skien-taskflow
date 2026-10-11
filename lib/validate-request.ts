import { z } from "zod";
import ApiResponse from "@/helpers/ApiResponse";

export async function validateJsonRequest<T extends z.ZodType>(
  request: Request,
  schema: T,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false as const,
      response: ApiResponse(400, "Request body must be valid JSON."),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false as const,
      response: ApiResponse(
        400,
        "Invalid request data.",
        result.error.flatten().fieldErrors,
      ),
    };
  }

  return { success: true as const, data: result.data as z.output<T> };
}
