"""
Configuración de la sesión de base de datos
"""
import json
import boto3
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from aws_lambda_powertools import Logger

from src.core.config import settings

logger = Logger()

Base = declarative_base()

engine = None
async_session_maker = None


def get_db_credentials():
    """Obtener credenciales de la base de datos desde Secrets Manager"""
    if not settings.DB_SECRET_ARN:
        # Para desarrollo local
        return {
            "host": "localhost",
            "port": 5432,
            "username": "postgres",
            "password": "postgres",
            "dbname": "participantes"
        }

    try:
        client = boto3.client('secretsmanager', region_name=settings.AWS_REGION)
        response = client.get_secret_value(SecretId=settings.DB_SECRET_ARN)
        secret = json.loads(response['SecretString'])
        return secret
    except Exception as e:
        logger.error(f"Error obteniendo credenciales de DB: {str(e)}")
        raise


def get_database_url():
    """Construir URL de conexión a la base de datos"""
    if settings.DATABASE_URL:
        return settings.DATABASE_URL

    creds = get_db_credentials()
    return (
        f"postgresql+asyncpg://{creds['username']}:{creds['password']}"
        f"@{creds['host']}:{creds['port']}/{creds['dbname']}"
    )


async def init_db():
    """Inicializar conexión a la base de datos"""
    global engine, async_session_maker

    database_url = get_database_url()

    engine = create_async_engine(
        database_url,
        echo=settings.STAGE == "dev",
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
    )

    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    logger.info("Base de datos inicializada correctamente")


async def get_db():
    """Dependency para obtener una sesión de base de datos"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
