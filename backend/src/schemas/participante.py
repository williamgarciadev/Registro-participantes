"""
Schemas Pydantic para validación de datos de Participante
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field

from src.models.participante import EstadoParticipante


class ParticipanteBase(BaseModel):
    """Schema base para Participante"""
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre del participante")
    apellido: str = Field(..., min_length=1, max_length=100, description="Apellido del participante")
    email: EmailStr = Field(..., description="Email del participante")
    telefono: Optional[str] = Field(None, max_length=20, description="Teléfono del participante")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata adicional")


class ParticipanteCreate(ParticipanteBase):
    """Schema para crear un Participante"""
    pass


class ParticipanteUpdate(BaseModel):
    """Schema para actualizar un Participante"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = Field(None, max_length=20)
    estado: Optional[EstadoParticipante] = None
    metadata: Optional[Dict[str, Any]] = None


class ParticipanteResponse(ParticipanteBase):
    """Schema para respuesta de Participante"""
    id: UUID
    estado: EstadoParticipante
    fecha_registro: datetime

    class Config:
        from_attributes = True


class ParticipanteList(BaseModel):
    """Schema para lista de Participantes"""
    participantes: List[ParticipanteResponse]
    total: int
    skip: int
    limit: int
