"""
Punto de entrada principal de la aplicación FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.logging import correlation_paths

from src.api.v1 import router as api_v1_router
from src.core.config import settings
from src.database.session import init_db

# Configurar logger y tracer de AWS
logger = Logger(service=settings.SERVICE_NAME)
tracer = Tracer(service=settings.SERVICE_NAME)

# Crear instancia de FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para registro de participantes",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Evento de inicio de la aplicación"""
    logger.info("Iniciando aplicación")
    await init_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre de la aplicación"""
    logger.info("Cerrando aplicación")


@app.get("/", tags=["Health"])
@tracer.capture_method
def root():
    """Endpoint raíz para verificar que la API está funcionando"""
    logger.info("Health check solicitado")
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
@tracer.capture_method
def health_check():
    """Endpoint de health check"""
    return {"status": "healthy"}


# Incluir routers de la API
app.include_router(api_v1_router, prefix="/api/v1")

# Handler para AWS Lambda
handler = Mangum(app, lifespan="off")
