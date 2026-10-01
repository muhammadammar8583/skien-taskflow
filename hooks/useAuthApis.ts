'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  ChangePasswordRequest,
  clearAuthError,
  ForgotPasswordRequest,
  LoginRequest,
  logout,
  RegisterRequest,
  ResetPasswordRequest,
} from '@/reducers/AuthReducer'
import type {
  AuthOperationPayload,
  LoginCredentials,
  RegisterPayload,
} from '@/services/AuthApiServices'

export function useAuthApis() {
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { loading, error } = useAppSelector((state) => state.auth)

  const handleLoginRequest = (payload: LoginCredentials, handleNext?: () => void) =>
    dispatch(LoginRequest(payload)).unwrap().then(() => handleNext?.()).catch(() => undefined)

  const handleRegisterRequest = (payload: RegisterPayload, handleNext?: () => void) =>
    dispatch(RegisterRequest(payload)).unwrap().then(() => handleNext?.()).catch(() => undefined)

  const handleForgotPasswordRequest = (payload: { email: string }, handleNext?: () => void) =>
    dispatch(ForgotPasswordRequest(payload)).unwrap().then(() => handleNext?.()).catch(() => undefined)

  const handleResetPasswordRequest = (payload: AuthOperationPayload, handleNext?: () => void) =>
    dispatch(ResetPasswordRequest(payload)).unwrap().then(() => handleNext?.()).catch(() => undefined)

  const handleChangePasswordRequest = (payload: AuthOperationPayload, handleNext?: () => void) =>
    dispatch(ChangePasswordRequest(payload)).unwrap().then(() => handleNext?.()).catch(() => undefined)

  const handleLogoutRequestLocal = () => {
    queryClient.clear()
    dispatch(logout())
  }

  return {
    handleLoginRequest,
    handleRegisterRequest,
    handleForgotPasswordRequest,
    handleResetPasswordRequest,
    handleChangePasswordRequest,
    handleLogoutRequestLocal,
    clearAuthError: () => dispatch(clearAuthError()),
    loading,
    error,
  }
}