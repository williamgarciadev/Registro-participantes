import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import ParticipanteForm from '@/components/ParticipanteForm'
import { participantesApi } from '@/services/participantes'
import type { ParticipanteCreate, ParticipanteUpdate } from '@/types/participante'
import { usePageHeader } from '@/components/PageHeaderContext'

export default function NuevoParticipantePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setHeader, resetHeader } = usePageHeader()

  useEffect(() => {
    setHeader({
      title: 'Nuevo participante',
      subtitle: 'Registra un nuevo participante en el sistema',
      actions: null,
    })

    return () => {
      resetHeader()
    }
  }, [resetHeader, setHeader])

  const createMutation = useMutation({
    mutationFn: participantesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participantes'] })
      toast.success('Participante creado correctamente')
      navigate('/participantes')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al crear participante'
      toast.error(message)
    },
  })

  const handleSubmit = (data: ParticipanteCreate | ParticipanteUpdate) => {
    createMutation.mutate(data as ParticipanteCreate)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-1">Nuevo participante</h1>
        <p className="text-secondary mt-1">Registra un nuevo participante en el sistema</p>
      </div>

      <div className="card">
        <ParticipanteForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  )
}
