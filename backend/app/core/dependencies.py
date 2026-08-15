"""
SAHAYOG — FastAPI dependencies for authentication and authorization.

Provides reusable dependency functions:
  - get_current_user(): extracts and validates JWT, returns User
  - require_role(*roles): restricts access to specific RBAC roles
  - require_agency_scope(): ensures agency staff can only modify their own resources
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Extract and validate the JWT from the Authorization header.
    Returns the authenticated User object.

    Raises 401 if:
      - Token is missing or malformed
      - Token is expired
      - User does not exist or is inactive
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_TOKEN", "message": "Invalid or expired access token"}},
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "INVALID_TOKEN", "message": "Token missing subject claim"}},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": "USER_NOT_FOUND", "message": "User not found or inactive"}},
        )

    return user


def require_role(*allowed_roles: str):
    """
    Dependency factory that restricts access to specific RBAC roles.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(user: User = Depends(require_role("SUPER_ADMIN"))):
            ...
    """

    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "INSUFFICIENT_PERMISSIONS",
                        "message": f"Role '{current_user.role}' does not have access. Required: {list(allowed_roles)}",
                    }
                },
            )
        return current_user

    return role_checker


def require_agency_scope():
    """
    Dependency that ensures the current user has an agency_id set.
    Used by endpoints that operate on agency-scoped resources.

    SUPER_ADMIN and STATE_OPERATOR can bypass this check.

    Returns the user if authorized.
    """

    async def agency_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role in ("SUPER_ADMIN", "STATE_OPERATOR"):
            return current_user
        if current_user.agency_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": "NO_AGENCY_SCOPE",
                        "message": "User is not associated with any agency",
                    }
                },
            )
        return current_user

    return agency_checker
