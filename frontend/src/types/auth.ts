export interface TokenResponse {
  access_token: string
  token_type: string
  expires_at: string
}

export interface AuthenticatedUser {
  id: string
  email: string
  full_name?: string | null
  is_superuser: boolean
  roles: string[]
  permissions: string[]
}
