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
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.db.session import get_db
from app.models.agency import Agency
from app.models.district import District
from app.models.refresh_token import RefreshToken
from app.models.user import User
import uuid
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


async def auto_seed_if_empty(db: AsyncSession):
    """Auto-create tables if missing and seed default districts, agencies, and users via AsyncSession."""
    try:
        from app.db.base import Base
        from app.db.database import async_engine
        import app.models  # noqa: F401

        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        # Check districts
        d_cnt = (await db.execute(select(District))).scalars().all()
        if not d_cnt:
            districts = [
                District(id=uuid.UUID('70d4b8aa-050d-584c-b7f0-faea542083d7'), name="Kota", state="Rajasthan", latitude=25.2138, longitude=75.8648),
                District(id=uuid.UUID('7d015e2d-e657-5302-9ad8-3201ddb853a6'), name="Bundi", state="Rajasthan", latitude=25.4415, longitude=75.6450),
                District(id=uuid.UUID('42c99de7-fffc-51db-a2dc-d72b5848d5ea'), name="Baran", state="Rajasthan", latitude=25.1011, longitude=76.5132),
                District(id=uuid.UUID('405fcfda-0929-5f19-9f80-b42f9c298021'), name="Jhalawar", state="Rajasthan", latitude=24.5969, longitude=76.1600),
            ]
            db.add_all(districts)
            await db.flush()

        # Check agencies
        a_cnt = (await db.execute(select(Agency))).scalars().all()
        if not a_cnt:
            agencies = [
                Agency(id=uuid.UUID('f7f2d306-3499-5527-b5a6-845e2b290fa6'), name="NDRF Battalion 5", type="NDRF", contact_info={"phone": "+91-141-2750000"}),
                Agency(id=uuid.UUID('7a155fd1-7fce-5327-802c-4a3129155b44'), name="Indian Army - Jaipur Division", type="ARMY", contact_info={"phone": "+91-141-2200000"}),
                Agency(id=uuid.UUID('e1026bb4-5a7a-594a-81a9-39dc62a12267'), name="Relief Foundation India", type="NGO", contact_info={"phone": "+91-141-2300000"}),
                Agency(id=uuid.UUID('71ee4cbc-9099-5efe-852a-ba68417838d0'), name="Rajasthan State Disaster Management Authority", type="STATE_AUTHORITY", contact_info={"phone": "+91-141-2227296"}),
            ]
            db.add_all(agencies)
            await db.flush()

        # Users
        u_data = [
            (uuid.UUID('a0000000-0000-0000-0000-000000000001'), None, "System Administrator", "admin@sahayog.gov.in", "SUPER_ADMIN", "Admin@123"),
            (uuid.UUID('a0000000-0000-0000-0000-000000000002'), uuid.UUID('71ee4cbc-9099-5efe-852a-ba68417838d0'), "Rajesh Kumar", "rajesh.kumar@sdma.rajasthan.gov.in", "STATE_OPERATOR", "StateOp@123"),
            (uuid.UUID('a0000000-0000-0000-0000-000000000003'), uuid.UUID('f7f2d306-3499-5527-b5a6-845e2b290fa6'), "Col. Anil Sharma", "anil.sharma@ndrf.gov.in", "AGENCY_ADMIN", "NdrfAdmin@123"),
            (uuid.UUID('a0000000-0000-0000-0000-000000000005'), uuid.UUID('7a155fd1-7fce-5327-802c-4a3129155b44'), "Brig. Vikram Singh", "vikram.singh@army.mil.in", "AGENCY_ADMIN", "ArmyAdmin@123"),
            (uuid.UUID('a0000000-0000-0000-0000-000000000007'), uuid.UUID('e1026bb4-5a7a-594a-81a9-39dc62a12267'), "Priya Mehta", "priya.mehta@relieffoundation.org", "AGENCY_ADMIN", "NgoAdmin@123"),
        ]
        for uid, agency_id, name, email, role, pwd in u_data:
            existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if not existing:
                db.add(User(id=uid, agency_id=agency_id, name=name, email=email, role=role, password_hash=hash_password(pwd)))
        await db.commit()
        logger.info("Async database auto-seeding completed.")
    except Exception as e:
        logger.error("Async database auto-seeding error: %s", e)
        await db.rollback()


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

    if user is None:
        await auto_seed_if_empty(db)
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
