import ApiConstants from '@/constants/ApiConstants'
import NetworkRequest from '@/helpers/NetworkRequest'

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
}

export type AuthOperationPayload = Record<string, unknown>

export interface AuthApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T | null
}

async function apiLogin(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await NetworkRequest.post<AuthApiResponse<AuthSession>>(
    ApiConstants.login,
    credentials,
  )
  const session = response.data.data

  if (!session) {
    throw new Error(response.data.message || 'Authentication failed.')
  }

  return session
}

async function apiLogout(): Promise<void> {
  await NetworkRequest.post(ApiConstants.logout)
}

async function apiRegister(payload: RegisterPayload): Promise<AuthUser> {
  const response = await NetworkRequest.post<AuthApiResponse<AuthUser>>(
    ApiConstants.register,
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
    ApiConstants.forgotPassword,
    payload,
  )
  return response.data
}

async function apiResetPassword(payload: AuthOperationPayload) {
  const response = await NetworkRequest.post<AuthApiResponse<unknown>>(
    ApiConstants.resetPassword,
    payload,
  )
  return response.data
}

async function apiChangePassword(payload: AuthOperationPayload) {
  const response = await NetworkRequest.post<AuthApiResponse<unknown>>(
    ApiConstants.changePassword,
    payload,
  )
  return response.data
}

export const AuthApiServices = {
  apiLogin,
  apiLogout,
  apiRegister,
  apiForgotPassword,
  apiResetPassword,
  apiChangePassword,
}