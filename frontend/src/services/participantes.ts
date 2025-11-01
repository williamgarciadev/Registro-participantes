import api from './api'
import type {
  Participante,
  ParticipanteCreate,
  ParticipanteUpdate,
  ParticipanteList,
  EstadoParticipante,
} from '@/types/participante'

const BASE_URL = '/api/v1/participantes'

export const participantesApi = {
  // Obtener lista de participantes
  getAll: async (params?: {
    skip?: number
    limit?: number
    estado?: EstadoParticipante
  }): Promise<ParticipanteList> => {
    const { data } = await api.get<ParticipanteList>(BASE_URL, { params })
    return data
  },

  // Obtener un participante por ID
  getById: async (id: string): Promise<Participante> => {
    const { data } = await api.get<Participante>(`${BASE_URL}/${id}`)
    return data
  },

  // Crear un participante
  create: async (participante: ParticipanteCreate): Promise<Participante> => {
    const { data } = await api.post<Participante>(BASE_URL, participante)
    return data
  },

  // Actualizar un participante
  update: async (
    id: string,
    participante: ParticipanteUpdate
  ): Promise<Participante> => {
    const { data } = await api.put<Participante>(`${BASE_URL}/${id}`, participante)
    return data
  },

  // Eliminar un participante
  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`)
  },

  // Buscar participantes
  search: async (params: {
    q: string
    skip?: number
    limit?: number
  }): Promise<ParticipanteList> => {
    const { data } = await api.get<ParticipanteList>(`${BASE_URL}/search`, { params })
    return data
  },
}
