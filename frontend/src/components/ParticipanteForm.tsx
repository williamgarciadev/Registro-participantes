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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="form-group">
          <label htmlFor="nombre" className="form-label">
            Nombre <span className="text-error-500">*</span>
          </label>
          <input
            {...register('nombre')}
            type="text"
            id="nombre"
            className="input focus-ring"
            placeholder="Ingrese el nombre"
            autoComplete="given-name"
            aria-invalid={errors.nombre ? 'true' : 'false'}
            aria-describedby={errors.nombre ? 'nombre-error' : undefined}
          />
          {errors.nombre && (
            <p id="nombre-error" className="form-error" role="alert">
              ⚠️ {errors.nombre.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="apellido" className="form-label">
            Apellido <span className="text-error-500">*</span>
          </label>
          <input
            {...register('apellido')}
            type="text"
            id="apellido"
            className="input focus-ring"
            placeholder="Ingrese el apellido"
            autoComplete="family-name"
            aria-invalid={errors.apellido ? 'true' : 'false'}
            aria-describedby={errors.apellido ? 'apellido-error' : undefined}
          />
          {errors.apellido && (
            <p id="apellido-error" className="form-error" role="alert">
              ⚠️ {errors.apellido.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email <span className="text-error-500">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input focus-ring"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="form-error" role="alert">
              ⚠️ {errors.email.message}
            </p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="telefono" className="form-label">
            Teléfono <span className="text-text-tertiary text-xs">(Opcional)</span>
          </label>
          <input
            {...register('telefono')}
            type="tel"
            id="telefono"
            className="input focus-ring"
            placeholder="+1 234 567 8900"
            autoComplete="tel"
            aria-invalid={errors.telefono ? 'true' : 'false'}
            aria-describedby={errors.telefono ? 'telefono-error' : undefined}
          />
          {errors.telefono && (
            <p id="telefono-error" className="form-error" role="alert">
              ⚠️ {errors.telefono.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border-muted">
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
          className="btn btn-primary" 
          disabled={isLoading}
          aria-label={isLoading ? 'Guardando...' : 'Guardar participante'}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  )
}
