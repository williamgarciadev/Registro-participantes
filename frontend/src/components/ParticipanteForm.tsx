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

export default function ParticipanteForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ParticipanteFormProps) {
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

  // Actualizar el formulario cuando initialData cambia
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            {...register('nombre')}
            type="text"
            id="nombre"
            className="input"
            placeholder="Juan"
            autoComplete="given-name"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            {...register('apellido')}
            type="text"
            id="apellido"
            className="input"
            placeholder="Pérez"
            autoComplete="family-name"
          />
          {errors.apellido && (
            <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="input"
            placeholder="juan.perez@example.com"
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            {...register('telefono')}
            type="tel"
            id="telefono"
            className="input"
            placeholder="+1 234 567 8900"
            autoComplete="tel"
          />
          {errors.telefono && (
            <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
