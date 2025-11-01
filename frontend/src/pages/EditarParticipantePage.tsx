import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import ParticipanteForm from '@/components/ParticipanteForm'
import { participantesApi } from '@/services/participantes'
import type { ParticipanteUpdate } from '@/types/participante'

export default function EditarParticipantePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: participante, isLoading, refetch } = useQuery({
    queryKey: ['participante', id],
    queryFn: () => participantesApi.getById(id!),
    enabled: !!id,
  })

  // Re-ejecutar query cuando el ID cambia
  useEffect(() => {
    if (id) {
      refetch()
    }
  }, [id, refetch])

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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-gray-600">Cargando participante...</p>
      </div>
    )
  }

  if (!participante) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Participante no encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Editar Participante</h1>
        <p className="text-gray-600 mt-1">
          Actualiza la información del participante
        </p>
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
