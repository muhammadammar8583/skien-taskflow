import { NextResponse } from "next/server";

const ApiResponse = (statusCode: number, message: string, data?: any) => {
    return NextResponse.json({
        status: statusCode >= 200 && statusCode < 300 ? "success" : "error",
        message: message,
        data: data !== null ? data : null,
    }, { status: statusCode });
}

export default ApiResponse;