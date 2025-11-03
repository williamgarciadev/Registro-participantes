import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'

/**
 * LoginPreview - Vista previa del diseño del Login
 * Esta es una versión standalone para preview del diseño AdminLTE
 * El equipo de auth está implementando la versión funcional en LoginPage.tsx
 */
export default function LoginPreview() {
  const [email, setEmail] = useState('admin@demo.local')
  const [password, setPassword] = useState('admin123')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsAuthenticating(true)
    
    // Simular loading
    setTimeout(() => {
      setIsAuthenticating(false)
      alert('Vista previa - La autenticación real será implementada por el equipo de Auth')
    }, 1500)
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="dialog" aria-labelledby="login-title">
        <div className="auth-card__header">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <LogIn className="h-8 w-8 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h1 id="login-title" className="auth-card__title">
              Registro de Participantes
            </h1>
            <p className="auth-card__subtitle">Ingresa tus credenciales para acceder al panel</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="form-input"
              placeholder="tu.email@ejemplo.com"
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

          <button 
            type="submit" 
            className="btn btn-primary w-full justify-center" 
            disabled={isAuthenticating}
            style={{ marginTop: '0.5rem' }}
          >
            {isAuthenticating ? (
              <>
                <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} aria-hidden="true"></span>
                Verificando...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <p className="auth-card__hint">
          ¿Necesitas acceso? Contacta con el administrador del sistema
        </p>

        <Link to="/" className="auth-card__link">
          ← Volver al inicio
        </Link>
      </div>

      {/* Badge de preview */}
      <div style={{ 
        position: 'fixed', 
        bottom: '1rem', 
        right: '1rem', 
        padding: '0.5rem 1rem',
        background: '#ffc107',
        color: '#000',
        borderRadius: '0.25rem',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999
      }}>
        🎨 Vista Previa - Diseño AdminLTE v3
      </div>
    </div>
  )
}
