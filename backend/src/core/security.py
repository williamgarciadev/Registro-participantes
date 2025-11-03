"""
Utilidades de seguridad y dependencias comunes para autenticación basada en JWT
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Iterable, Optional, Union

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.database.session import get_db
from src.models.user import User
from src.services.user_service import UserService

# Contexto para hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Esquema OAuth2 para FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña en texto plano con su hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera el hash seguro de una contraseña"""
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, int],
    *,
    expires_delta: Optional[timedelta] = None,
    scopes: Optional[Iterable[str]] = None,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """Genera un JWT de acceso con información básica del usuario"""
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    expire = now + expires_delta

    payload: dict[str, Any] = {
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    if scopes:
        payload["scopes"] = list(scopes)

    if extra_claims:
        payload.update(extra_claims)

    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_token(token: str) -> dict[str, Any]:
    """Decodifica un JWT y devuelve el payload validado"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        ) from exc


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Obtiene el usuario autenticado a partir del token de acceso"""
    payload = decode_token(token)

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sin sujeto válido",
        )

    user = await UserService.get_by_id(db, subject)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inválido o inactivo",
        )

    return user


def require_roles(*required_roles: str) -> Callable[[User], User]:
    """
    Genera una dependencia que garantiza que el usuario tenga alguno de los roles requeridos.
    Los superusuarios tienen acceso total por defecto.
    """

    async def _dependency(user: User = Depends(get_current_user)) -> User:
        if user.is_superuser or not required_roles:
            return user

        user_role_names = {role.name for role in user.roles}
        if user_role_names.intersection(required_roles):
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a este recurso",
        )

    return _dependency


def require_permissions(*permission_codes: str) -> Callable[[User, AsyncSession], User]:
    """
    Genera una dependencia que garantiza que el usuario cuente con todos los permisos solicitados.
    Los superusuarios tienen acceso total.
    """

    async def _dependency(
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> User:
        if user.is_superuser or not permission_codes:
            return user

        user_permissions = await UserService.list_permissions_for_user(db, user)
        missing = [code for code in permission_codes if code not in user_permissions]

        if not missing:
            return user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No cuentas con los permisos necesarios",
        )

    return _dependency
