import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { toast } from 'react-toastify'
import { authApi } from '@/services/auth'
import { registerUnauthorizedHandler, setAuthToken } from '@/services/api'
import type { AuthenticatedUser } from '@/types/auth'

interface AuthContextValue {
  user: AuthenticatedUser | null
  token: string | null
  initializing: boolean
  isAuthenticating: boolean
  login: (email: string, password: string) => Promise<AuthenticatedUser>
  logout: () => void
  hasPermission: (code: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'rp_auth_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [token, setTokenState] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const setToken = (nextToken: string | null) => {
    setTokenState(nextToken)
    setAuthToken(nextToken)
    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  }

  const loadProfile = async (storedToken: string) => {
    try {
      setToken(storedToken)
      const profile = await authApi.profile()
      setUser(profile)
    } catch (error) {
      setToken(null)
      setUser(null)
      console.error('No fue posible recuperar la sesión', error)
    } finally {
      setInitializing(false)
    }
  }

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (storedToken) {
      loadProfile(storedToken)
    } else {
      setInitializing(false)
    }
    registerUnauthorizedHandler(() => {
      setToken(null)
      setUser(null)
      toast.error('Tu sesión ha expirado, inicia sesión nuevamente')
    })
    return () => {
      registerUnauthorizedHandler(null)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsAuthenticating(true)
    try {
      const tokenResponse = await authApi.login(email, password)
      setToken(tokenResponse.access_token)
      const profile = await authApi.profile()
      setUser(profile)
      toast.success('Sesión iniciada correctamente')
      return profile
    } catch (error) {
      setToken(null)
      setUser(null)
      throw error
    } finally {
      setIsAuthenticating(false)
      setInitializing(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  const hasPermission = (code: string) => {
    if (!user) {
      return false
    }
    return user.is_superuser || user.permissions.includes(code)
  }

  const hasRole = (role: string) => {
    if (!user) {
      return false
    }
    return user.is_superuser || user.roles.includes(role)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      initializing,
      isAuthenticating,
      login,
      logout,
      hasPermission,
      hasRole,
    }),
    [user, token, initializing, isAuthenticating]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }
  return context
}
