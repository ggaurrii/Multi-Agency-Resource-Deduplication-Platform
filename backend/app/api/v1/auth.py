"""
SAHAYOG — Authentication API endpoints.

POST /api/v1/auth/login    — Authenticate, return access + refresh JWT
POST /api/v1/auth/refresh  — Exchange refresh token for new access token
POST /api/v1/auth/logout   — Revoke refresh token
GET  /api/v1/auth/me       — Get current authenticated user info
"""

import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
)
from app.db.session import get_db
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    RefreshRequest,
    TokenResponse,
    UserInfo,
)

logger = logging.getLogger("sahayog.auth")
settings = get_settings()

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user",
    description="Validates credentials and returns JWT access + refresh tokens (FR-SEC-01).",
)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email/password, receive tokens."""
    # Find user by email
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(request.password, user.password_hash):
        logger.warning("Failed login attempt for email: %s", request.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": {"code": "ACCOUNT_DISABLED", "message": "Account is disabled"}},
        )

    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "agency_id": str(user.agency_id) if user.agency_id else None,
        }
    )

    # Create and store refresh token (hashed)
    raw_refresh_token = create_refresh_token()
    refresh_token_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(raw_refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(refresh_token_record)
    await db.commit()

    logger.info("User %s (%s) logged in successfully", user.email, user.role)

    return LoginResponse(
        user=UserInfo(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
            agency_id=str(user.agency_id) if user.agency_id else None,
        ),
        access_token=access_token,
        refresh_token=raw_refresh_token,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access token (NFR-SEC-03).",
)
async def refresh_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange refresh token for new access token."""
    token_hash = hash_refresh_token(request.refresh_token)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
    )
    stored_token = result.scalar_one_or_none()

    if stored_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_REFRESH_TOKEN", "message": "Refresh token is invalid or revoked"}},
        )

    if stored_token.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "EXPIRED_REFRESH_TOKEN", "message": "Refresh token has expired"}},
        )

    # Load the user
    user_result = await db.execute(select(User).where(User.id == stored_token.user_id))
    user = user_result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "USER_NOT_FOUND", "message": "User not found or inactive"}},
        )

    # Revoke old refresh token (rotate)
    stored_token.revoked_at = datetime.now(timezone.utc)

    # Issue new tokens
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role,
            "agency_id": str(user.agency_id) if user.agency_id else None,
        }
    )
    new_raw_refresh = create_refresh_token()
    new_refresh_record = RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(new_raw_refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(new_refresh_record)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_raw_refresh,
        expires_in=settings.jwt_access_token_expire_minutes * 60,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout / revoke refresh token",
    description="Revokes the provided refresh token (NFR-SEC-03).",
)
async def logout(request: LogoutRequest, db: AsyncSession = Depends(get_db)):
    """Revoke a refresh token on logout."""
    token_hash = hash_refresh_token(request.refresh_token)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token_hash == token_hash,
            RefreshToken.revoked_at.is_(None),
        )
    )
    stored_token = result.scalar_one_or_none()

    if stored_token is not None:
        stored_token.revoked_at = datetime.now(timezone.utc)
        await db.commit()

    # Always return success (don't leak whether the token was valid)
    return {"message": "Logged out successfully"}


@router.get(
    "/me",
    response_model=UserInfo,
    summary="Get current user",
    description="Returns the authenticated user's profile information.",
)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's info."""
    return UserInfo(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        agency_id=str(current_user.agency_id) if current_user.agency_id else None,
    )
