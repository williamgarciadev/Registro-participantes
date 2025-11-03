import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ParticipanteCreate, ParticipanteUpdate } from '@/types/participante'

const participanteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  apellido: z.string().min(1, 'El apellido es requerido').max(100),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20).optional(),
})

type ParticipanteFormData = z.infer<typeof participanteSchema>

interface ParticipanteFormProps {
  initialData?: ParticipanteUpdate
  onSubmit: (data: ParticipanteCreate | ParticipanteUpdate) => void
  isLoading?: boolean
}

export default function ParticipanteForm({ initialData, onSubmit, isLoading = false }: ParticipanteFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParticipanteFormData>({
    resolver: zodResolver(participanteSchema),
    defaultValues: {
      nombre: initialData?.nombre || '',
      apellido: initialData?.apellido || '',
      email: initialData?.email || '',
      telefono: initialData?.telefono || '',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
      })
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-adminlte">
      {/* Card de información personal */}
      <div className="card">
        <div className="card-header-adminlte">
          <h3 className="card-title-adminlte">Información Personal</h3>
          <p className="card-subtitle-adminlte">Datos básicos del participante</p>
        </div>
        <div className="card-body-adminlte">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group-adminlte">
              <label htmlFor="nombre" className="form-label-adminlte">
                Nombre <span className="text-error-500">*</span>
              </label>
              <input
                {...register('nombre')}
                type="text"
                id="nombre"
                className={`input-adminlte ${errors.nombre ? 'input-error' : ''}`}
                placeholder="Ingrese el nombre"
                autoComplete="given-name"
                aria-invalid={errors.nombre ? 'true' : 'false'}
                aria-describedby={errors.nombre ? 'nombre-error' : undefined}
              />
              {errors.nombre && (
                <p id="nombre-error" className="form-error-adminlte" role="alert">
                  <span className="form-error-icon">⚠</span>
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="form-group-adminlte">
              <label htmlFor="apellido" className="form-label-adminlte">
                Apellido <span className="text-error-500">*</span>
              </label>
              <input
                {...register('apellido')}
                type="text"
                id="apellido"
                className={`input-adminlte ${errors.apellido ? 'input-error' : ''}`}
                placeholder="Ingrese el apellido"
                autoComplete="family-name"
                aria-invalid={errors.apellido ? 'true' : 'false'}
                aria-describedby={errors.apellido ? 'apellido-error' : undefined}
              />
              {errors.apellido && (
                <p id="apellido-error" className="form-error-adminlte" role="alert">
                  <span className="form-error-icon">⚠</span>
                  {errors.apellido.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card de contacto */}
      <div className="card">
        <div className="card-header-adminlte">
          <h3 className="card-title-adminlte">Información de Contacto</h3>
          <p className="card-subtitle-adminlte">Datos para comunicación</p>
        </div>
        <div className="card-body-adminlte">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="form-group-adminlte">
              <label htmlFor="email" className="form-label-adminlte">
                Email <span className="text-error-500">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`input-adminlte ${errors.email ? 'input-error' : ''}`}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="form-error-adminlte" role="alert">
                  <span className="form-error-icon">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="form-group-adminlte">
              <label htmlFor="telefono" className="form-label-adminlte">
                Teléfono <span className="text-text-tertiary text-xs font-normal">(Opcional)</span>
              </label>
              <input
                {...register('telefono')}
                type="tel"
                id="telefono"
                className={`input-adminlte ${errors.telefono ? 'input-error' : ''}`}
                placeholder="+1 234 567 8900"
                autoComplete="tel"
                aria-invalid={errors.telefono ? 'true' : 'false'}
                aria-describedby={errors.telefono ? 'telefono-error' : undefined}
              />
              {errors.telefono && (
                <p id="telefono-error" className="form-error-adminlte" role="alert">
                  <span className="form-error-icon">⚠</span>
                  {errors.telefono.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer con botones */}
      <div className="form-footer-adminlte">
        <button 
          type="button" 
          onClick={() => window.history.back()} 
          className="btn btn-secondary" 
          disabled={isLoading}
          aria-label="Cancelar y volver"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn btn-primary btn-submit-adminlte" 
          disabled={isLoading}
          aria-label={isLoading ? 'Guardando...' : 'Guardar participante'}
        >
          {isLoading ? (
            <>
              <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar Participante
            </>
          )}
        </button>
      </div>
    </form>
  )
}
