from typing import List

from pydantic import BaseModel, Field

from .base import PermissionResponse, RoleResponse, UserResponse, UserSummary


class PaginatedUsers(BaseModel):
    items: List[UserSummary] = Field(default_factory=list)
    total: int
    limit: int
    offset: int


class PaginatedRoles(BaseModel):
    items: List[RoleResponse] = Field(default_factory=list)
    total: int
    limit: int
    offset: int


class PaginatedPermissions(BaseModel):
    items: List[PermissionResponse] = Field(default_factory=list)
    total: int
    limit: int
    offset: int
