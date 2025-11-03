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

    # CORS
    CORS_ORIGINS: List[str] = ["*"]  # En producción, especificar dominios permitidos

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
