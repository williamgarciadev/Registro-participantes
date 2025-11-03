import api from './api'
import type { AuthenticatedUser, TokenResponse } from '@/types/auth'

const BASE_URL = '/api/v1/auth'

export interface PasswordResetRequestPayload {
  email: string
}

export interface PasswordResetRequestResponse {
  message: string
  email: string
}

export interface PasswordResetConfirmPayload {
  token: string
  new_password: string
  confirm_password: string
}

export interface PasswordResetConfirmResponse {
  message: string
  email: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>(`${BASE_URL}/login/json`, { email, password })
    return data
  },

  profile: async (): Promise<AuthenticatedUser> => {
    const { data } = await api.get<AuthenticatedUser>(`${BASE_URL}/profile`)
    return data
  },
  
  requestPasswordReset: async (payload: PasswordResetRequestPayload): Promise<PasswordResetRequestResponse> => {
    const { data } = await api.post<PasswordResetRequestResponse>(`${BASE_URL}/password-reset/request`, payload)
    return data
  },
  
  confirmPasswordReset: async (payload: PasswordResetConfirmPayload): Promise<PasswordResetConfirmResponse> => {
    const { data } = await api.post<PasswordResetConfirmResponse>(`${BASE_URL}/password-reset/confirm`, payload)
    return data
  },
}

export default authApi
