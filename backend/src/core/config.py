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

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
