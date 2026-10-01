import ApiConstants from '@/constants/ApiConstants'
import AppRoutes from '@/helpers/AppRoutes'
import NetworkRequest, { getHeaders } from '@/helpers/NetworkRequest'

export interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterPayload extends LoginCredentials {
  first_name: string
  last_name: string
  confirm_password: string
}

export interface AuthSession {
  user: AuthUser
  token: string
}

export type AuthOperationPayload = Record<string, unknown>

export interface AuthApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T | null
}

async function apiLogin(credentials: LoginCredentials): Promise<AuthSession> {
//   const response = await NetworkRequest.post<AuthApiResponse<AuthSession>>(
//     AppRoutes.api.auth.login,
//     credentials,
//   )
//   const session = response.data.data

//   if (!session) {
//     throw new Error(response.data.message || 'Authentication failed.')
//   }

//   return session
return await NetworkRequest.post(`${ApiConstants.login}`, credentials, getHeaders(undefined, {}));
}

async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  const response = await NetworkRequest.post<AuthApiResponse<AuthUser>>(
    AppRoutes.api.auth.register,
    payload,
  )
  const user = response.data.data

  if (!user) {
    throw new Error(response.data.message || 'Registration failed.')
  }

  return user
}

async function apiForgotPassword(payload: { email: string }) {
  const response = await NetworkRequest.post<AuthApiResponse<unknown>>(
    AppRoutes.api.auth.forgotPassword,
    payload,
  )
  return response.data
}

async function apiResetPassword(payload: AuthOperationPayload) {
  const response = await NetworkRequest.post<AuthApiResponse<unknown>>(
    AppRoutes.api.auth.resetPassword,
    payload,
  )
  return response.data
}

async function apiChangePassword(payload: AuthOperationPayload) {
  const response = await NetworkRequest.post<AuthApiResponse<unknown>>(
    AppRoutes.api.auth.changePassword,
    payload,
  )
  return response.data
}

export const AuthApiServices = {
  apiLogin,
  apiRegister,
  apiForgotPassword,
  apiResetPassword,
  apiChangePassword,
}