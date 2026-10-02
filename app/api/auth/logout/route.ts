import ApiResponse from "@/helpers/ApiResponse";
import ApiMessages from "@/helpers/ApiMessages";

export async function POST() {
  const response = ApiResponse(200, ApiMessages.success.userLoggedOut, null);
  response.cookies.delete('auth-token');
  return response;
}