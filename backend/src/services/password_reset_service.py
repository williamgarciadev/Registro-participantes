"""
Servicio para gestión de tokens de recuperación de contraseña
"""
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from aws_lambda_powertools import Logger

from src.models.password_reset import PasswordResetToken
from src.models.user import User
from src.services.email_service import EmailService
from src.core.security import get_password_hash

logger = Logger(service="password-reset-service")


class PasswordResetService:
    """Servicio para gestión de recuperación de contraseñas"""

    @staticmethod
    async def create_reset_token(db: AsyncSession, email: str) -> Optional[PasswordResetToken]:
        """
        Crea un token de reset de contraseña para el usuario con el email dado.
        
        Args:
            db: Sesión asíncrona de base de datos
            email: Email del usuario
            
        Returns:
            Token creado o None si el usuario no existe
            
        Note:
            Por seguridad, no revelamos si el email existe o no.
            Siempre retornamos success incluso si el usuario no existe.
        """
        # Buscar usuario por email
        result = await db.execute(
            select(User).where(User.email == email, User.is_active == True)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Por seguridad, no revelamos que el usuario no existe
            logger.info(f"Intento de reset para email no registrado: {email}")
            return None
        
        # Invalidar tokens previos del usuario (marcarlos como usados)
        prev_tokens_result = await db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.used_at == None
            )
        )
        prev_tokens = prev_tokens_result.scalars().all()
        
        for token in prev_tokens:
            token.used_at = datetime.now()
        
        # Crear nuevo token
        new_token = PasswordResetToken.create_token(user.id)
        db.add(new_token)
        await db.commit()
        await db.refresh(new_token)
        
        logger.info(
            "Token de reset creado",
            extra={
                "user_id": str(user.id),
                "email": email,
                "token": str(new_token.token),
                "expires_at": new_token.expires_at.isoformat()
            }
        )
        
        return new_token

    @staticmethod
    async def send_reset_email(
        db: AsyncSession,
        email: str,
        token: PasswordResetToken
    ) -> bool:
        """
        Envía el email de recuperación de contraseña.
        
        Args:
            db: Sesión de base de datos
            email: Email del destinatario
            token: Token de reset
            
        Returns:
            True si se envió exitosamente
        """
        # Obtener usuario para el nombre
        result = await db.execute(
            select(User).where(User.id == token.user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(f"Usuario no encontrado para token {token.token}")
            return False
        
        # Enviar email
        success = await EmailService.send_password_reset_email(
            to_email=email,
            reset_token=str(token.token),
            user_name=user.full_name
        )
        
        return success

    @staticmethod
    async def validate_and_get_token(
        db: AsyncSession,
        token_str: str
    ) -> PasswordResetToken:
        """
        Valida un token de reset y lo retorna si es válido.
        
        Args:
            db: Sesión de base de datos
            token_str: String del token
            
        Returns:
            Token válido
            
        Raises:
            HTTPException 400: Si el token es inválido, expirado o usado
        """
        # Validar formato UUID
        try:
            UUID(token_str)  # Solo para validar formato
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido"
            )
        
        # Buscar token (comparar como string, no UUID)
        result = await db.execute(
            select(PasswordResetToken).where(PasswordResetToken.token == token_str)
        )
        token = result.scalar_one_or_none()
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o no encontrado"
            )
        
        # Verificar si está expirado
        if token.is_expired:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El token ha expirado. Solicita uno nuevo."
            )
        
        # Verificar si ya fue usado
        if token.is_used:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este token ya fue utilizado"
            )
        
        return token

    @staticmethod
    async def reset_password(
        db: AsyncSession,
        token: PasswordResetToken,
        new_password: str
    ) -> User:
        """
        Resetea la contraseña del usuario usando un token válido.
        
        Args:
            db: Sesión de base de datos
            token: Token de reset válido
            new_password: Nueva contraseña en texto plano
            
        Returns:
            Usuario actualizado
            
        Raises:
            HTTPException 404: Si el usuario no existe
        """
        # Obtener usuario
        result = await db.execute(
            select(User).where(User.id == token.user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado"
            )
        
        # Actualizar contraseña
        user.hashed_password = get_password_hash(new_password)
        
        # Marcar token como usado
        token.used_at = datetime.now()
        
        await db.commit()
        await db.refresh(user)
        
        logger.info(
            "Contraseña actualizada exitosamente",
            extra={
                "user_id": str(user.id),
                "email": user.email,
                "token": str(token.token)
            }
        )
        
        return user

    @staticmethod
    async def cleanup_expired_tokens(db: AsyncSession) -> int:
        """
        Limpia tokens expirados (más de 24 horas).
        Este método puede ejecutarse como tarea programada.
        
        Args:
            db: Sesión de base de datos
            
        Returns:
            Cantidad de tokens eliminados
        """
        cutoff_date = datetime.now() - timedelta(hours=24)
        
        result = await db.execute(
            select(PasswordResetToken).where(
                PasswordResetToken.expires_at < cutoff_date
            )
        )
        expired_tokens = result.scalars().all()
        
        count = len(expired_tokens)
        
        for token in expired_tokens:
            await db.delete(token)
        
        await db.commit()
        
        logger.info(f"Limpieza de tokens: {count} tokens expirados eliminados")
        
        return count
