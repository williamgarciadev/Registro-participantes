import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { authApi } from '@/services/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const resetMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset({ email }),
    onSuccess: (data) => {
      setIsSuccess(true)
      toast.success('Email enviado exitosamente')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al enviar el email'
      toast.error(message)
      console.error('Error al solicitar reset:', error)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email')
      return
    }
    resetMutation.mutate(email)
  }

  if (isSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-card animate-scale-in" role="dialog" aria-labelledby="success-title">
          <div className="auth-card__header">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <h1 id="success-title" className="auth-card__title">
                Revisa tu email
              </h1>
              <p className="auth-card__subtitle">
                Hemos enviado instrucciones de recuperación
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con
                instrucciones para recuperar tu contraseña.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium mb-2">
                📬 ¿No recibiste el email?
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Verifica tu carpeta de spam o correo no deseado</li>
                <li>Asegúrate de haber ingresado el email correcto</li>
                <li>El link expirará en 1 hora</li>
              </ul>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-3">
            <Link to="/login" className="btn btn-primary w-full justify-center">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver al inicio de sesión
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsSuccess(false)
                setEmail('')
              }}
              className="btn btn-secondary w-full justify-center"
            >
              Intentar con otro email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="dialog" aria-labelledby="forgot-title">
        <div className="auth-card__header">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <Mail className="h-8 w-8 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h1 id="forgot-title" className="auth-card__title">
              Recuperar Contraseña
            </h1>
            <p className="auth-card__subtitle">
              Ingresa tu email y te enviaremos instrucciones
            </p>
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
              disabled={resetMutation.isPending}
            />
            <p className="text-xs text-gray-500 mt-2">
              Te enviaremos un enlace seguro para restablecer tu contraseña
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full justify-center"
            disabled={resetMutation.isPending}
            style={{ marginTop: '0.5rem' }}
          >
            {resetMutation.isPending ? (
              <>
                <span
                  className="spinner"
                  style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}
                  aria-hidden="true"
                ></span>
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" aria-hidden="true" />
                Enviar Instrucciones
              </>
            )}
          </button>
        </form>

        <p className="auth-card__hint">
          ¿Recordaste tu contraseña?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Iniciar sesión
          </Link>
        </p>

        <Link to="/" className="auth-card__link">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}
