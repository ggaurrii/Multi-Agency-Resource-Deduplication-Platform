"""
SAHAYOG — Database engine and session factory.

Provides both async (for FastAPI) and sync (for Alembic/scripts) engines.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

settings = get_settings()

# ── Async engine (used by FastAPI request handlers) ──────────
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ── Sync engine (used by Alembic migrations and seed scripts) ──
sync_engine = create_engine(
    settings.database_url_sync,
    echo=settings.debug,
    future=True,
)
