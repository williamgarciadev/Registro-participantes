"""
Configuración de la aplicación
"""
import os
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación"""

    # Información general
    PROJECT_NAME: str = "Registro de Participantes"
    SERVICE_NAME: str = "registro-participantes"
    VERSION: str = "1.0.0"

    # Entorno
    STAGE: str = "dev"

    # Base de datos
    DB_SECRET_ARN: str = ""
    DATABASE_URL: str = ""
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # AWS
    AWS_REGION: str = "us-east-1"

    # CORS - Lista de orígenes permitidos
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Frontend local
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    # Logging
    LOG_LEVEL: str = "INFO"

    # Seguridad y autenticación
    JWT_SECRET_KEY: str = "change-me"  # Reemplazar en entorno productivo mediante variable de entorno
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    LOGIN_RATE_LIMIT: int = 5
    LOGIN_RATE_WINDOW_SECONDS: int = 60
    
    # Email y recuperación de contraseña
    ENVIRONMENT: str = "development"  # development | production
    FRONTEND_URL: str = "http://localhost:3000"  # URL del frontend para links de reset
    EMAIL_FROM: str = "noreply@example.com"  # Email remitente
    PASSWORD_RESET_RATE_LIMIT: int = 3  # Intentos de reset por ventana de tiempo
    PASSWORD_RESET_RATE_WINDOW_SECONDS: int = 900  # 15 minutos
    
    # Gmail SMTP settings (para desarrollo)
    GMAIL_USER: str = "wgarciamunoz@gmail.com"  # tu-email@gmail.com
    GMAIL_APP_PASSWORD: str = "buxuiogqzgqrwecm"  # Contraseña de aplicación de Gmail (NO tu contraseña normal)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
