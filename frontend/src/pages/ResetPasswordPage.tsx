import { FormEvent, useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { authApi } from '@/services/auth'

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  // Validar token al cargar
  useEffect(() => {
    if (!token || token.length !== 36) {
      toast.error('Token inválido')
      setTimeout(() => navigate('/login'), 2000)
    }
  }, [token, navigate])

  // Validación en tiempo real de contraseña
  useEffect(() => {
    const errors: string[] = []
    
    if (newPassword.length > 0) {
      if (newPassword.length < 8) {
        errors.push('Mínimo 8 caracteres')
      }
      if (!/[A-Z]/.test(newPassword)) {
        errors.push('Al menos una mayúscula')
      }
      if (!/[a-z]/.test(newPassword)) {
        errors.push('Al menos una minúscula')
      }
      if (!/[0-9]/.test(newPassword)) {
        errors.push('Al menos un número')
      }
    }
    
    setPasswordErrors(errors)
  }, [newPassword])

  const resetMutation = useMutation({
    mutationFn: (payload: { token: string; new_password: string; confirm_password: string }) =>
      authApi.confirmPasswordReset(payload),
    onSuccess: (data) => {
      setIsSuccess(true)
      toast.success('Contraseña actualizada exitosamente')
      // Redirigir al login después de 3 segundos
      setTimeout(() => navigate('/login'), 3000)
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al actualizar la contraseña'
      toast.error(message)
      console.error('Error al resetear contraseña:', error)
    },
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    // Validaciones
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordErrors.length > 0) {
      toast.error('La contraseña no cumple con los requisitos de seguridad')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (!token) {
      toast.error('Token inválido')
      return
    }

    resetMutation.mutate({
      token,
      new_password: newPassword,
      confirm_password: confirmPassword,
    })
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
                ¡Contraseña Actualizada!
              </h1>
              <p className="auth-card__subtitle">Tu contraseña ha sido cambiada exitosamente</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 leading-relaxed">
                Ya puedes iniciar sesión con tu nueva contraseña. Serás redirigido automáticamente al
                inicio de sesión en unos segundos...
              </p>
            </div>
          </div>

          <div className="p-6 pt-0">
            <Link to="/login" className="btn btn-primary w-full justify-center">
              Ir al inicio de sesión ahora
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card" role="dialog" aria-labelledby="reset-title">
        <div className="auth-card__header">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
            <Lock className="h-8 w-8 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h1 id="reset-title" className="auth-card__title">
              Nueva Contraseña
            </h1>
            <p className="auth-card__subtitle">Ingresa tu nueva contraseña segura</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Nueva Contraseña */}
          <div className="form-field">
            <label htmlFor="new-password" className="form-label">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="form-input pr-10"
                placeholder="••••••••"
                disabled={resetMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Requisitos de contraseña */}
            {newPassword.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-xs font-medium text-gray-700">Requisitos de seguridad:</p>
                <ul className="space-y-1">
                  <PasswordRequirement
                    met={newPassword.length >= 8}
                    text="Mínimo 8 caracteres"
                  />
                  <PasswordRequirement
                    met={/[A-Z]/.test(newPassword)}
                    text="Al menos una mayúscula"
                  />
                  <PasswordRequirement
                    met={/[a-z]/.test(newPassword)}
                    text="Al menos una minúscula"
                  />
                  <PasswordRequirement
                    met={/[0-9]/.test(newPassword)}
                    text="Al menos un número"
                  />
                </ul>
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div className="form-field">
            <label htmlFor="confirm-password" className="form-label">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="form-input pr-10"
                placeholder="••••••••"
                disabled={resetMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Las contraseñas no coinciden
              </p>
            )}
            {confirmPassword.length > 0 && newPassword === confirmPassword && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Las contraseñas coinciden
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full justify-center"
            disabled={
              resetMutation.isPending ||
              passwordErrors.length > 0 ||
              newPassword !== confirmPassword ||
              !newPassword ||
              !confirmPassword
            }
            style={{ marginTop: '0.5rem' }}
          >
            {resetMutation.isPending ? (
              <>
                <span
                  className="spinner"
                  style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}
                  aria-hidden="true"
                ></span>
                Actualizando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" aria-hidden="true" />
                Cambiar Contraseña
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

// Componente auxiliar para mostrar requisitos
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-700' : 'text-gray-600'}>{text}</span>
    </li>
  )
}
