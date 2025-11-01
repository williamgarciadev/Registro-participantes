export enum EstadoParticipante {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
  PENDIENTE = 'pendiente',
}

export interface Participante {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono?: string
  estado: EstadoParticipante
  fecha_registro: string
  metadata?: Record<string, any>
}

export interface ParticipanteCreate {
  nombre: string
  apellido: string
  email: string
  telefono?: string
  metadata?: Record<string, any>
}

export interface ParticipanteUpdate {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  estado?: EstadoParticipante
  metadata?: Record<string, any>
}

export interface ParticipanteList {
  participantes: Participante[]
  total: number
  skip: number
  limit: number
}
