export interface UserSummary {
  id: string
  email: string
  full_name?: string | null
  is_active: boolean
  is_superuser: boolean
  roles: string[]
}

export interface UserResponse {
  id: string
  email: string
  full_name?: string | null
  is_active: boolean
  is_superuser: boolean
  last_login_at?: string | null
  created_at: string
  updated_at: string
  roles: RoleResponse[]
}

export interface PaginatedUsers {
  items: UserSummary[]
  total: number
  limit: number
  offset: number
}

export interface RoleResponse {
  id: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
  permissions: PermissionResponse[]
}

export interface PaginatedRoles {
  items: RoleResponse[]
  total: number
  limit: number
  offset: number
}

export interface PermissionResponse {
  id: string
  code: string
  name: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface PaginatedPermissions {
  items: PermissionResponse[]
  total: number
  limit: number
  offset: number
}

export interface PermissionCatalogItem {
  code: string
  name: string
  description?: string | null
  module: string
  action: string
}

export interface PermissionCatalogResponse {
  total: number
  modules: Record<string, PermissionCatalogItem[]>
}
