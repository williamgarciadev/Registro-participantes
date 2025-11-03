import api from './api'
import type { AuthenticatedUser, TokenResponse } from '@/types/auth'

const BASE_URL = '/api/v1/auth'

export const authApi = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>(`${BASE_URL}/login/json`, { email, password })
    return data
  },

  profile: async (): Promise<AuthenticatedUser> => {
    const { data } = await api.get<AuthenticatedUser>(`${BASE_URL}/profile`)
    return data
  },
}

export default authApi
