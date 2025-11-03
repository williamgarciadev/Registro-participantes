"""
Servicios simples de rate limiting en memoria.
"""
import asyncio
from collections import deque
from time import monotonic
from typing import Deque, Dict

from fastapi import HTTPException, status

from src.core.config import settings


class InMemoryRateLimiter:
    """Limita la cantidad de solicitudes por llave durante una ventana de tiempo."""

    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window = window_seconds
        self._requests: Dict[str, Deque[float]] = {}
        self._lock = asyncio.Lock()

    async def check(self, key: str) -> None:
        now = monotonic()
        async with self._lock:
            queue = self._requests.setdefault(key, deque())
            while queue and now - queue[0] > self.window:
                queue.popleft()
            if len(queue) >= self.limit:
                retry_after = int(self.window - (now - queue[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Demasiadas solicitudes. Intenta de nuevo en {retry_after} segundos.",
                )
            queue.append(now)


login_rate_limiter = InMemoryRateLimiter(
    limit=settings.LOGIN_RATE_LIMIT,
    window_seconds=settings.LOGIN_RATE_WINDOW_SECONDS,
)
