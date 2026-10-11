import { beforeEach, describe, expect, it, vi } from "vitest";
import { jwtVerify } from "jose";
import { jsonRequest, rawRequest, readApiResponse } from "./helpers";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  compare: vi.fn(),
  getJwtSecret: vi.fn(),
  loggerInfo: vi.fn(),
  logger: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: mocks.findUnique } },
}));
vi.mock("bcrypt", () => ({
  default: { compare: mocks.compare },
}));
vi.mock("@/lib/env", () => ({
  getJwtSecret: mocks.getJwtSecret,
}));
vi.mock("@/helpers/AppLoggger", () => ({
  default: Object.assign(mocks.logger, { info: mocks.loggerInfo }),
}));

import { POST } from "@/app/api/auth/login/route";

const jwtSecret = "test-jwt-secret-that-is-at-least-32-characters";
const user = {
  id: 17,
  first_name: "Taylor",
  last_name: "Example",
  email: "taylor@example.com",
  password: "stored-password-hash",
  authVersion: 3,
};

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.getJwtSecret.mockReturnValue(jwtSecret);
    mocks.findUnique.mockResolvedValue(user);
    mocks.compare.mockResolvedValue(true);
  });

  it("normalizes email, returns a safe user, and issues an authenticated JWT cookie", async () => {
    const response = await POST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "  TAYLOR@Example.com ",
        password: "correct-password",
      }),
    );
    const body = await readApiResponse(response);
    const cookie = response.cookies.get("auth-token");

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      message: expect.any(String),
      data: {
        user: {
          id: user.id,
          email: user.email,
          authVersion: user.authVersion,
        },
      },
    });
    expect(body.data).not.toHaveProperty("user.password");
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "taylor@example.com" },
    });
    expect(mocks.compare).toHaveBeenCalledWith(
      "correct-password",
      user.password,
    );
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.path).toBe("/");
    expect(cookie?.maxAge).toBe(60 * 60 * 24);

    const { payload, protectedHeader } = await jwtVerify(
      cookie!.value,
      new TextEncoder().encode(jwtSecret),
    );
    expect(protectedHeader.alg).toBe("HS256");
    expect(payload).toMatchObject({
      id: user.id,
      email: user.email,
      authVersion: user.authVersion,
    });
  });

  it("rejects malformed JSON and invalid credentials without querying the user", async () => {
    const malformed = await POST(
      rawRequest("http://localhost/api/auth/login", "{"),
    );
    expect(malformed.status).toBe(400);
    expect((await readApiResponse(malformed)).success).toBe(false);

    const invalid = await POST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "not-an-email",
        password: "",
      }),
    );

    expect(invalid.status).toBe(400);
    expect((await readApiResponse(invalid)).success).toBe(false);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it("rejects unknown users and incorrect passwords without issuing a cookie", async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    const unknownUser = await POST(
      jsonRequest("http://localhost/api/auth/login", {
        email: "missing@example.com",
        password: "password",
      }),
    );

    expect(unknownUser.status).toBe(404);
    expect(unknownUser.cookies.get("auth-token")).toBeUndefined();

    mocks.compare.mockResolvedValueOnce(false);
    const incorrectPassword = await POST(
      jsonRequest("http://localhost/api/auth/login", {
        email: user.email,
        password: "incorrect-password",
      }),
    );

    expect(incorrectPassword.status).toBe(401);
    expect(incorrectPassword.cookies.get("auth-token")).toBeUndefined();
  });

  it("returns an unsuccessful response when database access fails", async () => {
    mocks.findUnique.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      jsonRequest("http://localhost/api/auth/login", {
        email: user.email,
        password: "password",
      }),
    );

    expect(response.status).toBe(500);
    const body = await readApiResponse(response);
    expect(body).toMatchObject({
      success: false,
      message: "Internal server error",
      data: null,
    });
    expect(body.message).not.toContain("database unavailable");
    expect(response.cookies.get("auth-token")).toBeUndefined();
  });
});
