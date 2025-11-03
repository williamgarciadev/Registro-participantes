"""
Servicios relacionados con usuarios, roles y permisos
"""
from typing import Iterable, List, Optional, Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.user import Permission, Role, User


class UserService:
    """Servicio para gestionar usuarios, roles y permisos"""

    # ------------------------------------------------------------------
    # Consultas base
    # ------------------------------------------------------------------
    @staticmethod
    def _user_query():
        return select(User).options(
            selectinload(User.roles).selectinload(Role.permissions)
        )

    @staticmethod
    def _role_query():
        return select(Role).options(selectinload(Role.permissions))

    # ------------------------------------------------------------------
    # Utilidades privadas
    # ------------------------------------------------------------------
    @staticmethod
    async def _ensure_unique_email(db: AsyncSession, email: str, current_id: Optional[UUID] = None) -> None:
        query = select(User).where(User.email == email)
        if current_id:
            query = query.where(User.id != current_id)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electronico ya esta registrado",
            )

    @staticmethod
    async def _ensure_unique_role_name(db: AsyncSession, name: str, current_id: Optional[UUID] = None) -> None:
        query = select(Role).where(Role.name == name)
        if current_id:
            query = query.where(Role.id != current_id)
        result = await db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un rol con ese nombre",
            )

    # ------------------------------------------------------------------
    # Permisos
    # ------------------------------------------------------------------
    @staticmethod
    async def get_permission_by_code(db: AsyncSession, code: str) -> Optional[Permission]:
        result = await db.execute(select(Permission).where(Permission.code == code))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_permission_by_id(db: AsyncSession, permission_id: UUID) -> Optional[Permission]:
        result = await db.execute(select(Permission).where(Permission.id == permission_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_permissions_by_ids(db: AsyncSession, permission_ids: Sequence[UUID]) -> List[Permission]:
        if not permission_ids:
            return []
        result = await db.execute(select(Permission).where(Permission.id.in_(permission_ids)))
        permissions = result.scalars().all()
        if len(permissions) != len(set(permission_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uno o mas permisos no existen",
            )
        return permissions

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
    async def list_permissions(
        db: AsyncSession,
        *,
        limit: int,
        offset: int,
        search: Optional[str] = None,
    ) -> tuple[List[Permission], int]:
        query = select(Permission)
        count_query = select(func.count()).select_from(Permission)

        if search:
            pattern = f"%{search}%"
            condition = Permission.code.ilike(pattern) | Permission.name.ilike(pattern)
            query = query.where(condition)
            count_query = count_query.where(condition)

        query = query.order_by(Permission.code.asc()).offset(offset).limit(limit)

        result = await db.execute(query)
        permissions = result.scalars().all()

        total = await db.execute(count_query)
        return permissions, total.scalar_one()

    @staticmethod
    async def get_permissions_catalog(db: AsyncSession) -> dict[str, List[dict]]:
        """
        Retorna todos los permisos del sistema agrupados por módulo.
        Útil para UIs de administración y documentación.
        """
        result = await db.execute(select(Permission).order_by(Permission.code.asc()))
        all_permissions = result.scalars().all()

        # Agrupar permisos por módulo (primera parte antes del ':')
        catalog: dict[str, List[dict]] = {}
        for perm in all_permissions:
            # Extraer módulo y acción del código (formato: "modulo:accion")
            parts = perm.code.split(":", 1)
            module = parts[0] if len(parts) > 0 else "general"
            action = parts[1] if len(parts) > 1 else perm.code

            if module not in catalog:
                catalog[module] = []

            catalog[module].append({
                "code": perm.code,
                "name": perm.name,
                "description": perm.description,
                "module": module,
                "action": action,
            })

        return catalog

    # ------------------------------------------------------------------
    # Roles
    # ------------------------------------------------------------------
    @staticmethod
    async def get_role_by_id(db: AsyncSession, role_id: UUID) -> Optional[Role]:
        result = await db.execute(UserService._role_query().where(Role.id == role_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_role_by_name(db: AsyncSession, role_name: str) -> Optional[Role]:
        result = await db.execute(UserService._role_query().where(Role.name == role_name))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_roles_by_ids(db: AsyncSession, role_ids: Sequence[UUID]) -> List[Role]:
        if not role_ids:
            return []
        result = await db.execute(UserService._role_query().where(Role.id.in_(role_ids)))
        roles = result.scalars().all()
        if len(roles) != len(set(role_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uno o mas roles no existen",
            )
        return roles

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
    async def create_role_with_permissions(db: AsyncSession, payload) -> Role:
        existing = await UserService.get_role_by_name(db, payload.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe un rol con ese nombre",
            )

        permissions = await UserService.get_permissions_by_ids(db, payload.permission_ids or [])
        role = Role(name=payload.name, description=payload.description)
        role.permissions = permissions
        db.add(role)
        await db.flush()
        await db.refresh(role)
        return role

    @staticmethod
    async def update_role(db: AsyncSession, role_id: UUID, payload) -> Role:
        role = await UserService.get_role_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

        if payload.name and payload.name != role.name:
            await UserService._ensure_unique_role_name(db, payload.name, current_id=role_id)
            role.name = payload.name

        if payload.description is not None:
            role.description = payload.description

        if payload.permission_ids is not None:
            permissions = await UserService.get_permissions_by_ids(db, payload.permission_ids)
            role.permissions = permissions

        await db.flush()
        await db.refresh(role)
        return role

    @staticmethod
    async def delete_role(db: AsyncSession, role_id: UUID) -> None:
        role = await UserService.get_role_by_id(db, role_id)
        if not role:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")
        await db.delete(role)

    @staticmethod
    async def list_roles(
        db: AsyncSession,
        *,
        limit: int,
        offset: int,
        search: Optional[str] = None,
    ) -> tuple[List[Role], int]:
        query = UserService._role_query()
        count_query = select(func.count()).select_from(Role)

        if search:
            pattern = f"%{search}%"
            condition = Role.name.ilike(pattern)
            query = query.where(condition)
            count_query = count_query.where(condition)

        query = query.order_by(Role.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        roles = result.scalars().unique().all()

        total = await db.execute(count_query)
        return roles, total.scalar_one()

    # ------------------------------------------------------------------
    # Usuarios
    # ------------------------------------------------------------------
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        result = await db.execute(UserService._user_query().where(User.email == email))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        result = await db.execute(UserService._user_query().where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(
        db: AsyncSession,
        *,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        is_superuser: bool = False,
        is_active: bool = True,
        roles: Optional[Iterable[Role]] = None,
    ) -> User:
        await UserService._ensure_unique_email(db, email)

        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_superuser=is_superuser,
            is_active=is_active,
        )

        if roles:
            user.roles.extend(list(roles))

        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def create_user_with_roles(db: AsyncSession, payload) -> User:
        from src.core.security import get_password_hash
        
        roles = await UserService.get_roles_by_ids(db, payload.role_ids or [])
        hashed_password = get_password_hash(payload.password)
        return await UserService.create_user(
            db,
            email=payload.email,
            hashed_password=hashed_password,
            full_name=payload.full_name,
            is_superuser=payload.is_superuser,
            is_active=payload.is_active,
            roles=roles,
        )

    @staticmethod
    async def update_user(db: AsyncSession, user_id: UUID, payload) -> User:
        from src.core.security import get_password_hash
        
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

        if payload.email and payload.email != user.email:
            await UserService._ensure_unique_email(db, payload.email, current_id=user_id)
            user.email = payload.email

        if payload.full_name is not None:
            user.full_name = payload.full_name

        if payload.password:
            user.hashed_password = get_password_hash(payload.password)

        if payload.is_active is not None:
            user.is_active = payload.is_active

        if payload.is_superuser is not None:
            user.is_superuser = payload.is_superuser

        if payload.role_ids is not None:
            roles = await UserService.get_roles_by_ids(db, payload.role_ids)
            user.roles = roles

        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: UUID) -> None:
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
        user.is_active = False
        await db.flush()

    @staticmethod
    async def update_user_roles(db: AsyncSession, user_id: UUID, role_ids: List[UUID]) -> User:
        """
        Actualiza los roles de un usuario específico.
        
        Args:
            db: Sesión asíncrona de base de datos
            user_id: ID del usuario a actualizar
            role_ids: Lista de IDs de roles a asignar (reemplaza los existentes)
            
        Returns:
            Usuario actualizado con sus nuevos roles
            
        Raises:
            HTTPException 404: Si el usuario no existe
            HTTPException 400: Si algún rol no existe
        """
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Usuario no encontrado"
            )
        
        # Validar que todos los roles existen
        roles = await UserService.get_roles_by_ids(db, role_ids)
        if len(roles) != len(role_ids):
            found_ids = {role.id for role in roles}
            missing_ids = set(role_ids) - found_ids
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Roles no encontrados: {missing_ids}"
            )
        
        # Asignar nuevos roles
        user.roles = roles
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def list_users(
        db: AsyncSession,
        *,
        limit: int,
        offset: int,
        search: Optional[str],
        is_active: Optional[bool],
    ) -> tuple[List[User], int]:
        query = UserService._user_query()
        count_query = select(func.count()).select_from(User)

        if search:
            pattern = f"%{search}%"
            condition = User.email.ilike(pattern) | User.full_name.ilike(pattern)
            query = query.where(condition)
            count_query = count_query.where(condition)

        if is_active is not None:
            query = query.where(User.is_active == is_active)
            count_query = count_query.where(User.is_active == is_active)

        query = query.order_by(User.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        users = result.scalars().unique().all()

        total = await db.execute(count_query)
        return users, total.scalar_one()

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
            result = await db.execute(select(Permission.code))
            return [row[0] for row in result.all()]

        permissions: set[str] = set()
        for role in user.roles:
            for permission in role.permissions:
                permissions.add(permission.code)
        return sorted(permissions)
