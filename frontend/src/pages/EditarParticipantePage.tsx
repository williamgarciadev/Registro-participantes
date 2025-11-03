import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import ParticipanteForm from '@/components/ParticipanteForm'
import { participantesApi } from '@/services/participantes'
import type { ParticipanteUpdate } from '@/types/participante'
import { usePageHeader } from '@/components/PageHeaderContext'
import { useAuth } from '@/components/AuthProvider'

export default function EditarParticipantePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasPermission } = useAuth()
  const canManageParticipantes = hasPermission('participantes:manage')

  const { data: participante, isLoading, refetch } = useQuery({
    queryKey: ['participante', id],
    queryFn: () => participantesApi.getById(id!),
    enabled: canManageParticipantes && !!id,
  })

  useEffect(() => {
    if (id) {
      refetch()
    }
  }, [id, refetch])

  const { setHeader, resetHeader } = usePageHeader()

  useEffect(() => {
    setHeader({
      title: 'Editar participante',
      subtitle: participante
        ? `${participante.nombre} ${participante.apellido}`
        : 'Actualiza la informacion del participante',
      actions: null,
    })

    return () => {
      resetHeader()
    }
  }, [participante, resetHeader, setHeader])

  const updateMutation = useMutation({
    mutationFn: (data: ParticipanteUpdate) => participantesApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participantes'] })
      toast.success('Participante actualizado correctamente')
      navigate('/participantes')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al actualizar participante'
      toast.error(message)
    },
  })

  const handleSubmit = (data: ParticipanteUpdate) => {
    updateMutation.mutate(data)
  }

  if (!canManageParticipantes) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="mb-8">
          <h1 className="heading-1">Editar participante</h1>
          <p className="text-secondary mt-1">Necesitas permisos de edicion para actualizar participantes.</p>
        </div>

        <div className="card p-6 text-center">
          <h2 className="text-lg font-semibold text-text-primary">Acceso restringido</h2>
          <p className="mt-2 text-sm text-secondary">
            Solicita al administrador que te otorgue el permiso participantes:manage.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        <p className="mt-2 text-secondary">Cargando participante...</p>
      </div>
    )
  }

  if (!participante) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Participante no encontrado</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="heading-1">Editar participante</h1>
        <p className="text-secondary mt-1">Actualiza la informacion del participante</p>
      </div>

      <div className="card">
        <ParticipanteForm
          initialData={participante}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  )
}
