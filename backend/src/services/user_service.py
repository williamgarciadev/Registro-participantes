"""
Servicios relacionados con usuarios, roles y permisos
"""
from typing import Iterable, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from src.models.user import User, Role, Permission


class UserService:
    """Servicio para gestionar usuarios, roles y permisos"""

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_role_by_name(db: AsyncSession, role_name: str) -> Optional[Role]:
        result = await db.execute(select(Role).where(Role.name == role_name))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_role(
        db: AsyncSession,
        name: str,
        description: Optional[str] = None,
        permissions: Optional[Iterable[Permission]] = None,
    ) -> Role:
        existing = await UserService.get_role_by_name(db, name)
        if existing:
            return existing

        role = Role(name=name, description=description)
        if permissions:
            role.permissions.extend(list(permissions))

        db.add(role)
        await db.flush()
        await db.refresh(role)
        return role

    @staticmethod
    async def get_permission_by_code(db: AsyncSession, code: str) -> Optional[Permission]:
        result = await db.execute(select(Permission).where(Permission.code == code))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_permission(
        db: AsyncSession,
        code: str,
        name: str,
        description: Optional[str] = None,
    ) -> Permission:
        existing = await UserService.get_permission_by_code(db, code)
        if existing:
            return existing

        permission = Permission(code=code, name=name, description=description)
        db.add(permission)
        await db.flush()
        await db.refresh(permission)
        return permission

    @staticmethod
    async def create_user(
        db: AsyncSession,
        *,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        is_superuser: bool = False,
        roles: Optional[Iterable[Role]] = None,
    ) -> User:
        existing = await UserService.get_by_email(db, email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado",
            )

        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_superuser=is_superuser,
        )

        if roles:
            user.roles.extend(list(roles))

        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def assign_role_to_user(db: AsyncSession, user: User, role: Role) -> User:
        if role not in user.roles:
            user.roles.append(role)
            await db.flush()
            await db.refresh(user)
        return user

    @staticmethod
    async def list_permissions_for_user(db: AsyncSession, user: User) -> list[str]:
        if user.is_superuser:
            # Superusuario obtiene todos los permisos
            result = await db.execute(select(Permission.code))
            return [row[0] for row in result.all()]

        permissions: set[str] = set()
        for role in user.roles:
            for permission in role.permissions:
                permissions.add(permission.code)
        return sorted(permissions)
