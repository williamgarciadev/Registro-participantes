"""
Schemas para recuperación de contraseña
"""
from pydantic import BaseModel, EmailStr, Field, field_validator


class PasswordResetRequest(BaseModel):
    """Schema para solicitar reset de contraseña"""
    email: EmailStr = Field(..., description="Email del usuario que solicita el reset")


class PasswordResetConfirm(BaseModel):
    """Schema para confirmar reset de contraseña con token"""
    token: str = Field(..., min_length=36, max_length=36, description="Token de reset recibido por email")
    new_password: str = Field(..., min_length=8, max_length=128, description="Nueva contraseña")
    confirm_password: str = Field(..., min_length=8, max_length=128, description="Confirmación de contraseña")

    @field_validator('confirm_password')
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        """Valida que las contraseñas coincidan"""
        if 'new_password' in info.data and v != info.data['new_password']:
            raise ValueError('Las contraseñas no coinciden')
        return v


class PasswordResetResponse(BaseModel):
    """Schema para respuesta exitosa de solicitud de reset"""
    message: str = Field(..., description="Mensaje de confirmación")
    email: EmailStr = Field(..., description="Email al que se envió el link")
