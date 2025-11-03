from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer", serialization_alias="token_type")
    expires_at: datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthenticatedUser(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    is_superuser: bool = False
    roles: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
