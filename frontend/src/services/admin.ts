import api from './api'
import type {
  PaginatedPermissions,
  PaginatedRoles,
  PaginatedUsers,
  PermissionCatalogResponse,
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

  async getPermissionsCatalog() {
    const { data } = await api.get<PermissionCatalogResponse>(`${BASE_URL}/permissions/catalog`)
    return data
  },

  async createUser(payload: { email: string; password: string; full_name?: string; role_ids?: string[] }) {
    const { data } = await api.post<UserSummary>(`${BASE_URL}/users`, payload)
    return data
  },

  async updateUser(id: string, payload: { email?: string; password?: string; full_name?: string; is_active?: boolean; role_ids?: string[] }) {
    const { data } = await api.put<UserSummary>(`${BASE_URL}/users/${id}`, payload)
    return data
  },

  async deleteUser(id: string) {
    await api.delete(`${BASE_URL}/users/${id}`)
  },

  async createRole(payload: { name: string; description?: string; permission_ids?: string[] }) {
    const { data } = await api.post(`${BASE_URL}/roles`, payload)
    return data
  },

  async updateRole(id: string, payload: { name?: string; description?: string; permission_ids?: string[] }) {
    const { data } = await api.put(`${BASE_URL}/roles/${id}`, payload)
    return data
  },

  async deleteRole(id: string) {
    await api.delete(`${BASE_URL}/roles/${id}`)
  },
}

export default adminApi
