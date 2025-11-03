from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.security import require_permissions
from src.database.session import get_db
from src.schemas.user.base import (
    PermissionResponse,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    UserCreate,
    UserResponse,
    UserSummary,
    UserUpdate,
)
from src.schemas.user.responses import PaginatedPermissions, PaginatedRoles, PaginatedUsers
from src.services.user_service import UserService

router = APIRouter()


@router.get(
    "/users",
    response_model=PaginatedUsers,
    summary="Listar usuarios",
    dependencies=[Depends(require_permissions("users:view"))],
)
async def list_users(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(default=None, min_length=1),
    is_active: Optional[bool] = Query(default=None),
):
    users, total = await UserService.list_users(
        db,
        limit=limit,
        offset=offset,
        search=search,
        is_active=is_active,
    )
    summaries = [
        UserSummary(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            roles=[role.name for role in user.roles],
        )
        for user in users
    ]
    return PaginatedUsers(items=summaries, total=total, limit=limit, offset=offset)


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Obtener detalle de usuario",
    dependencies=[Depends(require_permissions("users:view"))],
)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    return user


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear usuario",
    dependencies=[Depends(require_permissions("users:manage"))],
)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await UserService.create_user_with_roles(db, payload)
    return user


@router.put(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Actualizar usuario",
    dependencies=[Depends(require_permissions("users:manage"))],
)
async def update_user(user_id: UUID, payload: UserUpdate, db: AsyncSession = Depends(get_db)):
    user = await UserService.update_user(db, user_id, payload)
    return user


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar usuario",
    dependencies=[Depends(require_permissions("users:manage"))],
)
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    await UserService.delete_user(db, user_id)


@router.get(
    "/roles",
    response_model=PaginatedRoles,
    summary="Listar roles",
    dependencies=[Depends(require_permissions("roles:view"))],
)
async def list_roles(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(default=None, min_length=1),
):
    roles, total = await UserService.list_roles(db, limit=limit, offset=offset, search=search)
    return PaginatedRoles(items=roles, total=total, limit=limit, offset=offset)


@router.post(
    "/roles",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear rol",
    dependencies=[Depends(require_permissions("roles:manage"))],
)
async def create_role(payload: RoleCreate, db: AsyncSession = Depends(get_db)):
    role = await UserService.create_role_with_permissions(db, payload)
    return role


@router.put(
    "/roles/{role_id}",
    response_model=RoleResponse,
    summary="Actualizar rol",
    dependencies=[Depends(require_permissions("roles:manage"))],
)
async def update_role(role_id: UUID, payload: RoleUpdate, db: AsyncSession = Depends(get_db)):
    role = await UserService.update_role(db, role_id, payload)
    return role


@router.delete(
    "/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar rol",
    dependencies=[Depends(require_permissions("roles:manage"))],
)
async def delete_role(role_id: UUID, db: AsyncSession = Depends(get_db)):
    await UserService.delete_role(db, role_id)


@router.get(
    "/permissions",
    response_model=PaginatedPermissions,
    summary="Listar permisos",
    dependencies=[Depends(require_permissions("permissions:view"))],
)
async def list_permissions(
    db: AsyncSession = Depends(get_db),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(default=None, min_length=1),
):
    permissions, total = await UserService.list_permissions(db, limit=limit, offset=offset, search=search)
    return PaginatedPermissions(items=permissions, total=total, limit=limit, offset=offset)
