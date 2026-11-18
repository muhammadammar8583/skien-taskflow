import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, rawRequest, readApiResponse } from "./helpers";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hash: vi.fn(),
  logger: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));
vi.mock("bcrypt", () => ({
  default: { hash: mocks.hash },
}));
vi.mock("@/helpers/AppLoggger", () => ({
  default: mocks.logger,
}));

import { POST } from "@/app/api/auth/register/route";

const password = "StrongPass123";
const passwordHash = "bcrypt-hash";

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    mocks.findUnique.mockResolvedValue(null);
    mocks.hash.mockResolvedValue(passwordHash);
    mocks.create.mockImplementation(async ({ data }) => ({
      id: 21,
      ...data,
      authVersion: 0,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    }));
  });

  it("normalizes input, hashes the password, and never returns the hash", async () => {
    const response = await POST(
      jsonRequest("http://localhost/api/auth/register", {
        first_name: "  Taylor ",
        last_name: " Example ",
        email: " TAYLOR@Example.com ",
        password,
        confirm_password: password,
      }),
    );
    const body = await readApiResponse(response);

    expect(response.status).toBe(201);
    expect(body).toMatchObject({
      success: true,
      data: {
        id: 21,
        first_name: "Taylor",
        last_name: "Example",
        email: "taylor@example.com",
      },
    });
    expect(body.data).not.toHaveProperty("password");
    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "taylor@example.com" },
    });
    expect(mocks.hash).toHaveBeenCalledWith(password, 10);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        first_name: "Taylor",
        last_name: "Example",
        email: "taylor@example.com",
        password: passwordHash,
      },
    });
  });

  it.each([
    ["invalid email", { first_name: "Taylor", last_name: "Example", email: "invalid", password, confirm_password: password }],
    ["weak password", { first_name: "Taylor", last_name: "Example", email: "taylor@example.com", password: "weak", confirm_password: "weak" }],
    ["password mismatch", { first_name: "Taylor", last_name: "Example", email: "taylor@example.com", password, confirm_password: "OtherPass123" }],
    ["missing fields", { email: "taylor@example.com" }],
  ])("rejects %s before database writes", async (_caseName, payload) => {
    const response = await POST(
      jsonRequest("http://localhost/api/auth/register", payload),
    );

    expect(response.status).toBe(400);
    expect((await readApiResponse(response)).success).toBe(false);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.hash).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON without creating an account", async () => {
    const response = await POST(
      rawRequest("http://localhost/api/auth/register", "{"),
    );

    expect(response.status).toBe(400);
    expect((await readApiResponse(response)).success).toBe(false);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns conflict when an account already exists", async () => {
    mocks.findUnique.mockResolvedValueOnce({ id: 9, email: "taylor@example.com" });

    const response = await POST(
      jsonRequest("http://localhost/api/auth/register", {
        first_name: "Taylor",
        last_name: "Example",
        email: "taylor@example.com",
        password,
        confirm_password: password,
      }),
    );

    expect(response.status).toBe(409);
    expect((await readApiResponse(response)).success).toBe(false);
    expect(mocks.hash).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns an unsuccessful response when persistence fails", async () => {
    mocks.create.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(
      jsonRequest("http://localhost/api/auth/register", {
        first_name: "Taylor",
        last_name: "Example",
        email: "taylor@example.com",
        password,
        confirm_password: password,
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
  });
});
