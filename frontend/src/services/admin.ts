import api from './api'
import type {
  PaginatedPermissions,
  PaginatedRoles,
  PaginatedUsers,
  UserSummary,
} from '@/types/admin'

const BASE_URL = '/api/v1'

export const adminApi = {
  async listUsers(params?: { limit?: number; offset?: number; search?: string; is_active?: boolean }) {
    const { data } = await api.get<PaginatedUsers>(`${BASE_URL}/users`, {
      params,
    })
    return data
  },

  async getUser(id: string) {
    const { data } = await api.get<UserSummary>(`${BASE_URL}/users/${id}`)
    return data
  },

  async listRoles(params?: { limit?: number; offset?: number; search?: string }) {
    const { data } = await api.get<PaginatedRoles>(`${BASE_URL}/roles`, {
      params,
    })
    return data
  },

  async listPermissions(params?: { limit?: number; offset?: number; search?: string }) {
    const { data } = await api.get<PaginatedPermissions>(`${BASE_URL}/permissions`, {
      params,
    })
    return data
  },
}

export default adminApi
