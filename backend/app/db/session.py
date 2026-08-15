"""
SAHAYOG — Database session dependency for FastAPI.

Usage in route handlers:
    async def my_route(db: AsyncSession = Depends(get_db)):
        ...
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session, ensuring cleanup on exit."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
