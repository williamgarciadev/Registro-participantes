import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage() {
  const { login, isAuthenticating, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('admin@demo.local')
  const [password, setPassword] = useState('admin123')

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await login(email, password)
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname
      const destination = from && from !== '/login' ? from : '/'
      navigate(destination, { replace: true })
    } catch (error) {
      console.error('Error al iniciar sesión', error)
      toast.error('No fue posible iniciar sesión con las credenciales proporcionadas')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="dialog" aria-labelledby="login-title">
        <div className="auth-card__header">
          <LogIn className="h-8 w-8 text-primary-500" aria-hidden="true" />
          <div>
            <h1 id="login-title" className="auth-card__title">
              Acceso al panel
            </h1>
            <p className="auth-card__subtitle">Ingresa tus credenciales para continuar</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input"
              placeholder="admin@demo.local"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center" disabled={isAuthenticating}>
            {isAuthenticating ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="auth-card__hint">
          ¿Necesitas acceso? Ponte en contacto con un administrador del sistema.
        </p>

        <Link to="/" className="auth-card__link">
          Volver al sitio
        </Link>
      </div>
    </div>
  )
}
