import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-response";
import { jsonRequest, rawRequest, readApiResponse } from "./helpers";

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
}));

vi.mock("@/services/password-reset.service", () => ({
  requestPasswordReset: mocks.requestPasswordReset,
}));

import { POST } from "@/app/api/auth/forgot-password/route";

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.requestPasswordReset.mockResolvedValue(undefined);
  });

  it("normalizes email, forwards the client IP, and returns a generic response", async () => {
    const request = jsonRequest(
      "http://localhost/api/auth/forgot-password",
      { email: "  TAYLOR@Example.com " },
    );
    request.headers.set("x-forwarded-for", "203.0.113.10, 10.0.0.2");

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(await readApiResponse(response)).toEqual({
      success: true,
      message: "If an account exists, an OTP has been sent",
      data: null,
    });
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith(
      "taylor@example.com",
      "203.0.113.10",
    );
  });

  it("keeps the same success response when the service finds no account", async () => {
    mocks.requestPasswordReset.mockResolvedValueOnce(undefined);

    const response = await POST(
      jsonRequest("http://localhost/api/auth/forgot-password", {
        email: "unknown@example.com",
      }),
    );

    expect(response.status).toBe(200);
    expect(await readApiResponse(response)).toEqual({
      success: true,
      message: "If an account exists, an OTP has been sent",
      data: null,
    });
  });

  it("rejects invalid email and malformed JSON without calling the service", async () => {
    const invalidEmail = await POST(
      jsonRequest("http://localhost/api/auth/forgot-password", {
        email: "not-an-email",
      }),
    );
    const malformedJson = await POST(
      rawRequest("http://localhost/api/auth/forgot-password", "{"),
    );

    expect(invalidEmail.status).toBe(400);
    expect(malformedJson.status).toBe(400);
    expect((await readApiResponse(invalidEmail)).success).toBe(false);
    expect((await readApiResponse(malformedJson)).success).toBe(false);
    expect(mocks.requestPasswordReset).not.toHaveBeenCalled();
  });

  it("preserves explicit rate-limit responses", async () => {
    mocks.requestPasswordReset.mockRejectedValueOnce(
      new ApiError("Too many requests. Please try again later.", 429),
    );

    const response = await POST(
      jsonRequest("http://localhost/api/auth/forgot-password", {
        email: "taylor@example.com",
      }),
    );

    expect(response.status).toBe(429);
    expect(await readApiResponse(response)).toMatchObject({
      success: false,
      message: "Too many requests. Please try again later.",
      data: null,
    });
  });

  it("does not disclose internal failures in the response", async () => {
    mocks.requestPasswordReset.mockRejectedValueOnce(
      new Error("database unavailable"),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await POST(
      jsonRequest("http://localhost/api/auth/forgot-password", {
        email: "taylor@example.com",
      }),
    );

    expect(response.status).toBe(500);
    expect(await readApiResponse(response)).toEqual({
      success: false,
      message: "An unexpected error occurred.",
      data: null,
    });
    expect(consoleError).toHaveBeenCalled();
  });
});
