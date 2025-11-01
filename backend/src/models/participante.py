"""
Modelo de datos para Participante
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from src.database.session import Base


class EstadoParticipante(str, enum.Enum):
    """Estados posibles de un participante"""
    ACTIVO = "activo"
    INACTIVO = "inactivo"
    PENDIENTE = "pendiente"


class Participante(Base):
    """Modelo de base de datos para Participante"""

    __tablename__ = "participantes"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    nombre = Column(String(100), nullable=False, index=True)
    apellido = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    telefono = Column(String(20), nullable=True)
    estado = Column(
        SQLEnum(EstadoParticipante),
        default=EstadoParticipante.ACTIVO,
        nullable=False,
        index=True
    )
    fecha_registro = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )
    metadata = Column(JSON, default=dict, nullable=True)

    def __repr__(self):
        return f"<Participante {self.nombre} {self.apellido} ({self.email})>"
