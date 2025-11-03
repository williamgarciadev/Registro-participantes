"""
Endpoints para gestión de participantes
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from aws_lambda_powertools import Logger, Tracer

from src.database.session import get_db
from src.models.participante import EstadoParticipante
from src.core.security import require_permissions
from src.schemas.participante import (
    ParticipanteCreate,
    ParticipanteUpdate,
    ParticipanteResponse,
    ParticipanteList,
)
from src.services.participante_service import ParticipanteService

logger = Logger()
tracer = Tracer()

router = APIRouter()


@router.post(
    "/",
    response_model=ParticipanteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo participante",
    dependencies=[Depends(require_permissions("participantes:manage"))],
)
@tracer.capture_method
async def create_participante(
    participante: ParticipanteCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crear un nuevo participante con la siguiente información:

    - **nombre**: Nombre del participante
    - **apellido**: Apellido del participante
    - **email**: Email único del participante
    - **telefono**: Teléfono (opcional)
    - **extra_data**: Datos adicionales en formato JSON (opcional)
    """
    logger.info(f"Creando participante: {participante.email}")
    return await ParticipanteService.create_participante(db, participante)


@router.get(
    "/",
    response_model=ParticipanteList,
    summary="Listar participantes",
    dependencies=[Depends(require_permissions("participantes:view"))],
)
@tracer.capture_method
async def list_participantes(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de registros"),
    estado: Optional[EstadoParticipante] = Query(None, description="Filtrar por estado"),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener lista de participantes con paginación.

    Puede filtrar por estado: activo, inactivo, pendiente
    """
    logger.info(f"Listando participantes: skip={skip}, limit={limit}, estado={estado}")
    participantes, total = await ParticipanteService.get_participantes(db, skip, limit, estado)

    return ParticipanteList(
        participantes=participantes,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get(
    "/search",
    response_model=ParticipanteList,
    summary="Buscar participantes",
    dependencies=[Depends(require_permissions("participantes:view"))],
)
@tracer.capture_method
async def search_participantes(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db)
):
    """
    Buscar participantes por nombre, apellido o email
    """
    logger.info(f"Buscando participantes: query={q}")
    participantes, total = await ParticipanteService.search_participantes(db, q, skip, limit)

    return ParticipanteList(
        participantes=participantes,
        total=total,
        skip=skip,
        limit=limit
    )


@router.get(
    "/{participante_id}",
    response_model=ParticipanteResponse,
    summary="Obtener un participante por ID",
    dependencies=[Depends(require_permissions("participantes:view"))],
)
@tracer.capture_method
async def get_participante(
    participante_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener información detallada de un participante específico
    """
    logger.info(f"Obteniendo participante: {participante_id}")
    return await ParticipanteService.get_participante(db, participante_id)


@router.put(
    "/{participante_id}",
    response_model=ParticipanteResponse,
    summary="Actualizar un participante",
    dependencies=[Depends(require_permissions("participantes:manage"))],
)
@tracer.capture_method
async def update_participante(
    participante_id: UUID,
    participante: ParticipanteUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualizar información de un participante existente
    """
    logger.info(f"Actualizando participante: {participante_id}")
    return await ParticipanteService.update_participante(db, participante_id, participante)


@router.delete(
    "/{participante_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un participante",
    dependencies=[Depends(require_permissions("participantes:manage"))],
)
@tracer.capture_method
async def delete_participante(
    participante_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Eliminar un participante (soft delete, cambia estado a inactivo)
    """
    logger.info(f"Eliminando participante: {participante_id}")
    await ParticipanteService.delete_participante(db, participante_id)
