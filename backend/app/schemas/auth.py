"""
SAHAYOG — Pydantic schemas for authentication.

Request/response models for login, token refresh, and logout.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """POST /api/v1/auth/login request body."""

    email: EmailStr
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """Successful login/refresh response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token TTL in seconds")


class RefreshRequest(BaseModel):
    """POST /api/v1/auth/refresh request body."""

    refresh_token: str


class LogoutRequest(BaseModel):
    """POST /api/v1/auth/logout request body."""

    refresh_token: str


class UserInfo(BaseModel):
    """Authenticated user info returned with token."""

    id: str
    name: str
    email: str
    role: str
    agency_id: str | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Full login response with user info and tokens."""

    user: UserInfo
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
