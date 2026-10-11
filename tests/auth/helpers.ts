import { NextRequest } from "next/server";

export type ApiResponseBody = {
  success: boolean;
  message: string;
  data: unknown;
};

export function jsonRequest(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function rawRequest(url: string, body: string): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function readApiResponse(response: Response) {
  return (await response.json()) as ApiResponseBody;
}
