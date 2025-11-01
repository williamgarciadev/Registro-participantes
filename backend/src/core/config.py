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
    STAGE: str = os.getenv("STAGE", "dev")

    # Base de datos
    DB_SECRET_ARN: str = os.getenv("DB_SECRET_ARN", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # AWS
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")

    # CORS
    CORS_ORIGINS: List[str] = ["*"]  # En producción, especificar dominios permitidos

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
