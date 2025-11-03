from fastapi import APIRouter
from src.api.v1.endpoints import participantes
from src.api.v1.endpoints.auth.router import router as auth_router
from src.api.v1.endpoints.users.router import router as users_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, tags=["usuarios"])
router.include_router(participantes.router, prefix="/participantes", tags=["participantes"])
