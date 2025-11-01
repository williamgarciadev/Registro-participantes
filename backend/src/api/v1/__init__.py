from fastapi import APIRouter
from src.api.v1.endpoints import participantes

router = APIRouter()

router.include_router(participantes.router, prefix="/participantes", tags=["participantes"])
