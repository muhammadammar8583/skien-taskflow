import { describe, expect, it } from "vitest";
import { readApiResponse } from "./helpers";
import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("returns success and expires the auth cookie", async () => {
    const response = await POST();
    const body = await readApiResponse(response);
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      message: "User logged out successfully",
      data: null,
    });
    expect(setCookie).toContain("auth-token=");
    expect(setCookie?.toLowerCase()).toContain(
      "expires=thu, 01 jan 1970 00:00:00 gmt",
    );
  });
});
