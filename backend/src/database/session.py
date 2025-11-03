"""
Configuración de la sesión de base de datos
"""
import json
import boto3
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
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
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
    )

    async_session_maker = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    logger.info("Base de datos inicializada correctamente")


async def create_tables():
    """Crear tablas e índices en la base de datos"""
    async with engine.begin() as conn:
        # Crear extensión UUID
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))

        # Crear tabla participantes
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS participantes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre VARCHAR(100) NOT NULL,
                apellido VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                telefono VARCHAR(20),
                estado VARCHAR(20) DEFAULT 'activo' NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                extra_data JSONB DEFAULT NULL
            )
        """))

        # Crear índices
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_participantes_email ON participantes(email)'))
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_participantes_estado ON participantes(estado)'))
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_participantes_fecha_registro ON participantes(fecha_registro)'))

        # Crear tabla registros_actividad
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS registros_actividad (
                id SERIAL PRIMARY KEY,
                participante_id UUID REFERENCES participantes(id) ON DELETE CASCADE,
                tipo_evento VARCHAR(100),
                descripcion TEXT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usuario VARCHAR(255)
            )
        """))

        # Crear índices de actividad
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_actividad_participante ON registros_actividad(participante_id)'))
        await conn.execute(text('CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON registros_actividad(fecha)'))

        logger.info("Tablas creadas correctamente")


async def get_db():
    """Dependency para obtener una sesión de base de datos"""
    if not async_session_maker:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            await session.rollback()
            raise
        finally:
            await session.close()
