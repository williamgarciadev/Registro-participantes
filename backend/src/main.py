"""
Punto de entrada principal de la aplicación FastAPI
"""
from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from mangum import Mangum
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.logging import correlation_paths

from src.api.v1 import router as api_v1_router
from src.core.config import settings
from src.database.session import init_db, create_tables

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

# Configurar CORS con logs de debug
logger.info(f"Configurando CORS para orígenes: {settings.CORS_ORIGINS}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Middleware para adjuntar cabeceras de seguridad basicas en cada respuesta."""
    response: Response = await call_next(request)
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=()")
    # HSTS solo tiene efecto en HTTPS, pero no afecta entornos locales HTTP
    response.headers.setdefault("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
    return response

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


@app.post("/init-db", tags=["Admin"])
@tracer.capture_method
async def init_database():
    """Endpoint para inicializar tablas en la base de datos"""
    logger.info("Inicializando tablas de la base de datos")
    try:
        from src.database.session import engine
        if engine is None:
            await init_db()
        await create_tables()
        return {"status": "ok", "message": "Tablas creadas correctamente"}
    except Exception as e:
        logger.error(f"Error al crear tablas: {str(e)}")
        return {"status": "error", "message": str(e)}


# Manejador de excepciones global
@app.exception_handler(RuntimeError)
async def runtime_error_handler(request: Request, exc: RuntimeError):
    logger.error(f"RuntimeError: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": f"Server error: {str(exc)}"}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"message": f"Server error: {str(exc)}"}
    )


# Incluir routers de la API
app.include_router(api_v1_router, prefix="/api/v1")


# Handler para AWS Lambda
handler = Mangum(app, lifespan="off")
