from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PermissionBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=100)
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=255)


class PermissionResponse(PermissionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PermissionCatalogItem(BaseModel):
    """Esquema para catálogo de permisos agrupados por módulo"""
    code: str
    name: str
    description: Optional[str] = None
    module: str = Field(..., description="Módulo al que pertenece el permiso (ej: 'participantes', 'users')")
    action: str = Field(..., description="Acción del permiso (ej: 'view', 'create', 'manage')")

    class Config:
        from_attributes = True


class PermissionCatalogResponse(BaseModel):
    """Respuesta del catálogo completo de permisos"""
    total: int = Field(..., description="Total de permisos en el sistema")
    modules: dict[str, List[PermissionCatalogItem]] = Field(
        ..., 
        description="Permisos agrupados por módulo"
    )


class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(default=None, max_length=255)


class RoleCreate(RoleBase):
    permission_ids: Optional[List[UUID]] = Field(default=None)


class RoleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=50)
    description: Optional[str] = Field(default=None, max_length=255)
    permission_ids: Optional[List[UUID]] = Field(default=None)


class RoleResponse(RoleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    permissions: List[PermissionResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=150)
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role_ids: Optional[List[UUID]] = Field(default=None)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(default=None, max_length=150)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    role_ids: Optional[List[UUID]] = Field(default=None)


class UserResponse(UserBase):
    id: UUID
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    roles: List[RoleResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class UserSummary(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool
    roles: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
