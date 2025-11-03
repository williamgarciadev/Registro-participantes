import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute() {
  const location = useLocation()
  const { user, initializing } = useAuth()

  if (initializing) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        Verificando sesión...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
