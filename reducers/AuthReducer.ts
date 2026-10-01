import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit'
import { getNetworkErrorMessage } from '@/helpers/NetworkRequest'
import {
  AuthApiServices,
  type AuthApiResponse,
  type AuthOperationPayload,
  type AuthSession,
  type AuthUser,
  type LoginCredentials,
  type RegisterPayload,
} from '@/services/AuthApiServices'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
}

export const LoginRequest = createAsyncThunk<
  AuthSession,
  LoginCredentials,
  { rejectValue: string }
>('auth/login', async (credentials, thunkApi) => {
  try {
    return await AuthApiServices.apiLogin(credentials)
  } catch (error) {
    return thunkApi.rejectWithValue(getNetworkErrorMessage(error, 'Authentication failed.'))
  }
})

export const RegisterRequest = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: string }
>('auth/register', async (payload, thunkApi) => {
  try {
    return await AuthApiServices.apiRegister(payload)
  } catch (error) {
    return thunkApi.rejectWithValue(getNetworkErrorMessage(error, 'Registration failed.'))
  }
})

export const ForgotPasswordRequest = createAsyncThunk<
  AuthApiResponse<unknown>,
  { email: string },
  { rejectValue: string }
>('auth/forgot-password', async (payload, thunkApi) => {
  try {
    return await AuthApiServices.apiForgotPassword(payload)
  } catch (error) {
    return thunkApi.rejectWithValue(getNetworkErrorMessage(error, 'Could not start password recovery.'))
  }
})

export const ResetPasswordRequest = createAsyncThunk<
  AuthApiResponse<unknown>,
  AuthOperationPayload,
  { rejectValue: string }
>('auth/reset-password', async (payload, thunkApi) => {
  try {
    return await AuthApiServices.apiResetPassword(payload)
  } catch (error) {
    return thunkApi.rejectWithValue(getNetworkErrorMessage(error, 'Could not reset the password.'))
  }
})

export const ChangePasswordRequest = createAsyncThunk<
  AuthApiResponse<unknown>,
  AuthOperationPayload,
  { rejectValue: string }
>('auth/change-password', async (payload, thunkApi) => {
  try {
    return await AuthApiServices.apiChangePassword(payload)
  } catch (error) {
    return thunkApi.rejectWithValue(getNetworkErrorMessage(error, 'Could not change the password.'))
  }
})

const AuthReducer = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      return initialState
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LoginRequest.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
      })
      .addMatcher(
        isAnyOf(
          LoginRequest.pending,
          RegisterRequest.pending,
          ForgotPasswordRequest.pending,
          ResetPasswordRequest.pending,
          ChangePasswordRequest.pending,
        ),
        (state) => {
          state.loading = true
          state.error = null
        },
      )
      .addMatcher(
        isAnyOf(
          LoginRequest.fulfilled,
          RegisterRequest.fulfilled,
          ForgotPasswordRequest.fulfilled,
          ResetPasswordRequest.fulfilled,
          ChangePasswordRequest.fulfilled,
        ),
        (state) => {
          state.loading = false
          state.error = null
        },
      )
      .addMatcher(
        isAnyOf(
          LoginRequest.rejected,
          RegisterRequest.rejected,
          ForgotPasswordRequest.rejected,
          ResetPasswordRequest.rejected,
          ChangePasswordRequest.rejected,
        ),
        (state, action) => {
          state.loading = false
          state.error = action.payload ?? action.error.message ?? 'Authentication request failed.'
        },
      )
  },
})

export const { logout, clearAuthError } = AuthReducer.actions
export default AuthReducer.reducer