"""
Modelo para tokens de recuperación de contraseña
"""
from datetime import datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database.session import Base


class PasswordResetToken(Base):
    """Token para reset de contraseña con expiración de 1 hora"""

    __tablename__ = "password_reset_tokens"

    # Primary key (el token mismo es un UUID único como string)
    token: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        index=True
    )

    # Foreign key al usuario
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Timestamp de expiración (1 hora desde creación)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    # Timestamp cuando se usó el token (None si aún no se ha usado)
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None
    )

    # Timestamps automáticos
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relación con User
    user: Mapped["User"] = relationship("User", back_populates="password_reset_tokens")

    def __repr__(self) -> str:
        return f"<PasswordResetToken {self.token} for user {self.user_id}>"

    @property
    def is_expired(self) -> bool:
        """Verifica si el token ha expirado"""
        return datetime.now(self.expires_at.tzinfo) > self.expires_at

    @property
    def is_used(self) -> bool:
        """Verifica si el token ya fue usado"""
        return self.used_at is not None

    @property
    def is_valid(self) -> bool:
        """Verifica si el token es válido (no expirado y no usado)"""
        return not self.is_expired and not self.is_used

    @classmethod
    def create_token(cls, user_id: UUID) -> "PasswordResetToken":
        """
        Factory method para crear un token nuevo con expiración de 1 hora.
        
        Args:
            user_id: ID del usuario para el cual crear el token
            
        Returns:
            Nueva instancia de PasswordResetToken
        """
        return cls(
            token=str(uuid4()),  # Generar UUID y convertir a string
            user_id=user_id,
            expires_at=datetime.now() + timedelta(hours=1)
        )
