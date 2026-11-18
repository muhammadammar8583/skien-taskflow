import { NextResponse } from "next/server";

const ApiResponse = (statusCode: number, message: string, data: unknown = null) =>
  NextResponse.json(
    {
      success: statusCode >= 200 && statusCode < 300,
      message,
      data,
    },
    { status: statusCode },
  );

export default ApiResponse;