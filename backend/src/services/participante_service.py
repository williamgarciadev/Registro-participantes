"""
Servicio para gestión de participantes
"""
from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from aws_lambda_powertools import Logger

from src.models.participante import Participante, EstadoParticipante
from src.schemas.participante import ParticipanteCreate, ParticipanteUpdate

logger = Logger()


class ParticipanteService:
    """Servicio para operaciones CRUD de participantes"""

    @staticmethod
    async def create_participante(
        db: AsyncSession,
        participante_data: ParticipanteCreate
    ) -> Participante:
        """Crear un nuevo participante"""
        # Verificar si el email ya existe
        result = await db.execute(
            select(Participante).where(Participante.email == participante_data.email)
        )
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El email {participante_data.email} ya está registrado"
            )

        # Crear nuevo participante
        participante = Participante(**participante_data.model_dump())
        db.add(participante)
        await db.flush()
        await db.refresh(participante)

        logger.info(f"Participante creado: {participante.id}")
        return participante

    @staticmethod
    async def get_participante(db: AsyncSession, participante_id: UUID) -> Participante:
        """Obtener un participante por ID"""
        result = await db.execute(
            select(Participante).where(Participante.id == participante_id)
        )
        participante = result.scalar_one_or_none()

        if not participante:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Participante {participante_id} no encontrado"
            )

        return participante

    @staticmethod
    async def get_participantes(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        estado: Optional[EstadoParticipante] = None
    ) -> tuple[List[Participante], int]:
        """Obtener lista de participantes con paginación"""
        query = select(Participante)

        if estado:
            query = query.where(Participante.estado == estado)

        # Contar total
        count_query = select(func.count()).select_from(Participante)
        if estado:
            count_query = count_query.where(Participante.estado == estado)

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Obtener participantes con paginación
        query = query.order_by(Participante.fecha_registro.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        participantes = result.scalars().all()

        return participantes, total

    @staticmethod
    async def update_participante(
        db: AsyncSession,
        participante_id: UUID,
        participante_data: ParticipanteUpdate
    ) -> Participante:
        """Actualizar un participante"""
        participante = await ParticipanteService.get_participante(db, participante_id)

        # Si se actualiza el email, verificar que no exista
        if participante_data.email and participante_data.email != participante.email:
            result = await db.execute(
                select(Participante).where(Participante.email == participante_data.email)
            )
            existing = result.scalar_one_or_none()

            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El email {participante_data.email} ya está registrado"
                )

        # Actualizar campos
        update_data = participante_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(participante, field, value)

        await db.flush()
        await db.refresh(participante)

        logger.info(f"Participante actualizado: {participante.id}")
        return participante

    @staticmethod
    async def delete_participante(db: AsyncSession, participante_id: UUID) -> None:
        """Eliminar un participante (soft delete cambiando estado)"""
        participante = await ParticipanteService.get_participante(db, participante_id)
        participante.estado = EstadoParticipante.INACTIVO

        await db.flush()
        logger.info(f"Participante eliminado (soft delete): {participante.id}")

    @staticmethod
    async def search_participantes(
        db: AsyncSession,
        query: str,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Participante], int]:
        """Buscar participantes por nombre, apellido o email"""
        search = f"%{query}%"
        sql_query = select(Participante).where(
            (Participante.nombre.ilike(search)) |
            (Participante.apellido.ilike(search)) |
            (Participante.email.ilike(search))
        )

        # Contar total
        count_query = select(func.count()).select_from(Participante).where(
            (Participante.nombre.ilike(search)) |
            (Participante.apellido.ilike(search)) |
            (Participante.email.ilike(search))
        )

        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Obtener participantes con paginación
        sql_query = sql_query.order_by(Participante.fecha_registro.desc()).offset(skip).limit(limit)
        result = await db.execute(sql_query)
        participantes = result.scalars().all()

        return participantes, total
