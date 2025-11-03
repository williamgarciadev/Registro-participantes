from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from aws_lambda_powertools import Logger

from src.core.config import settings
from src.core.security import create_access_token, get_current_user, get_password_hash, verify_password
from src.database.session import get_db
from src.models.user import User
from src.schemas.auth.token import AuthenticatedUser, LoginRequest, TokenResponse
from src.services.user_service import UserService
from src.services.rate_limiter import login_rate_limiter

router = APIRouter()
logger = Logger()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Valida credenciales contra la base de datos."""
    user = await UserService.get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


async def ensure_admin_role(db: AsyncSession) -> None:
    """
    Garantiza que exista el rol admin y un usuario inicial.
    Pensado para entornos demo/desarrollo; en producción se debe provisionar fuera de la API.
    """
    try:
        admin_role = await UserService.get_role_by_name(db, "admin")
        if admin_role:
            return

        view_participants = await UserService.create_permission(
            db,
            code="participantes:view",
            name="Ver participantes",
            description="Listar y consultar participantes",
        )
        manage_participants = await UserService.create_permission(
            db,
            code="participantes:manage",
            name="Gestionar participantes",
            description="Crear, editar y eliminar participantes",
        )
        view_reports = await UserService.create_permission(
            db,
            code="reports:view",
            name="Ver reportes",
            description="Consultar paneles e indicadores agregados",
        )
        view_users = await UserService.create_permission(
            db,
            code="users:view",
            name="Ver usuarios",
            description="Listar y consultar usuarios del sistema",
        )
        manage_users = await UserService.create_permission(
            db,
            code="users:manage",
            name="Gestionar usuarios",
            description="Crear, actualizar y desactivar usuarios",
        )
        view_roles = await UserService.create_permission(
            db,
            code="roles:view",
            name="Ver roles",
            description="Consultar roles disponibles en el sistema",
        )
        manage_roles = await UserService.create_permission(
            db,
            code="roles:manage",
            name="Gestionar roles",
            description="Crear y actualizar roles",
        )
        view_permissions = await UserService.create_permission(
            db,
            code="permissions:view",
            name="Ver permisos",
            description="Listar los permisos configurados",
        )

        admin_role = await UserService.create_role(
            db,
            name="admin",
            description="Administrador del sistema",
            permissions=[
                view_participants,
                manage_participants,
                view_reports,
                view_users,
                manage_users,
                view_roles,
                manage_roles,
                view_permissions,
            ],
        )

        hashed_password = get_password_hash("admin123")

        try:
            await UserService.create_user(
                db,
                email="admin@example.com",
                hashed_password=hashed_password,
                full_name="Administrador",
                is_superuser=True,
                roles=[admin_role],
            )
        except HTTPException:
            # Usuario ya existe, no es necesario duplicarlo
            pass
    except Exception as e:
        # Log el error pero no falla el endpoint
        logger.error(f"Error en ensure_admin_role: {str(e)}")
        raise


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Iniciar sesión y obtener token de acceso",
)
async def login_credentials(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db),
):
    client_key = request.headers.get("X-Forwarded-For", request.client.host if request.client else "anonymous")
    await login_rate_limiter.check(f"login_form:{client_key}")
    await ensure_admin_role(db)

    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    now = datetime.now(timezone.utc)
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        expires_delta=expires_delta,
        scopes=[role.name for role in user.roles],
        extra_claims={"is_superuser": user.is_superuser},
    )

    user.last_login_at = now

    return TokenResponse(
        access_token=token,
        expires_at=now + expires_delta,
    )


@router.post(
    "/login/json",
    response_model=TokenResponse,
    summary="Iniciar sesión con payload JSON",
)
async def login_json(credentials: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    # Limitar intentos por IP
    # Usamos los encabezados X-Forwarded-For en caso de que esté detrás de un proxy
    client_host = request.headers.get("X-Forwarded-For", request.client.host if request.client else "anonymous")
    client_key = f"{client_host}:{credentials.email.lower()}"
    await login_rate_limiter.check(f"login_json:{client_key}")
    await ensure_admin_role(db)

    user = await authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )

    now = datetime.now(timezone.utc)
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        subject=user.id,
        expires_delta=expires_delta,
        scopes=[role.name for role in user.roles],
        extra_claims={"is_superuser": user.is_superuser},
    )

    user.last_login_at = now

    return TokenResponse(
        access_token=token,
        expires_at=now + expires_delta,
    )


@router.get(
    "/profile",
    response_model=AuthenticatedUser,
    summary="Obtener perfil del usuario autenticado",
)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_db),
):
    permissions = await UserService.list_permissions_for_user(db, current_user)

    return AuthenticatedUser(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        is_superuser=current_user.is_superuser,
        roles=[role.name for role in current_user.roles],
        permissions=permissions,
    )


@router.post(
    "/init-permissions",
    summary="Inicializar permisos del sistema",
    description="Crea todos los permisos predefinidos del sistema si no existen. Útil para setup inicial.",
)
async def initialize_permissions(db: AsyncSession = Depends(get_db)):
    """
    Inicializa o actualiza los permisos del sistema.
    
    - Crea permisos que no existen
    - No modifica permisos existentes
    - Retorna estadísticas de la operación
    """
    from src.scripts.init_permissions import init_system_permissions
    
    result = await init_system_permissions(db)
    
    return {
        "message": "Permisos inicializados correctamente",
        "created": result["created"],
        "existing": result["existing"],
        "total": result["total"],
    }
