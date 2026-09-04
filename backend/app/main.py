"""
SAHAYOG — FastAPI application entry point.

Provides:
  - Health check endpoints (GET /health, GET /health/db)
  - API v1 router registration
  - OpenAPI docs at /docs (Swagger) and /redoc
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import get_settings
from app.db.database import async_engine

settings = get_settings()

# ── Logging ──────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("sahayog")


# ── Lifespan ─────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle events."""
    logger.info("SAHAYOG backend starting up — %s v%s", settings.app_name, settings.app_version)
    yield
    logger.info("SAHAYOG backend shutting down")
    await async_engine.dispose()


# ── Application ──────────────────────────────────────────────
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "SAHAYOG — Unified Multi-Agency Resource Deduplication & Allocation Platform. "
        "Backend API for disaster-relief resource orchestration."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ── Register API routers ────────────────────────────────────
from app.api.v1.allocations import router as allocations_router
from app.api.v1.audit_logs import router as audit_logs_router
from app.api.v1.auth import router as auth_router  # noqa: E402
from app.api.v1.damage_assessments import router as damage_assessments_router, field_report_recovery_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.field_reports import router as field_reports_router
from app.api.v1.needs import router as needs_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.resources import router as resources_router

app.include_router(auth_router, prefix="/api/v1")
app.include_router(needs_router, prefix="/api/v1")
app.include_router(resources_router, prefix="/api/v1")
app.include_router(allocations_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(audit_logs_router, prefix="/api/v1")
app.include_router(field_reports_router, prefix="/api/v1")
app.include_router(damage_assessments_router, prefix="/api/v1")
app.include_router(field_report_recovery_router, prefix="/api/v1")


# ── Health endpoints ─────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic liveness probe."""
    return {"status": "healthy", "service": settings.app_name, "version": settings.app_version}


@app.get("/health/db", tags=["Health"])
async def health_db():
    """Database connectivity and PostGIS availability check."""
    try:
        async with async_engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            result.scalar()
            postgis = await conn.execute(text("SELECT PostGIS_Version()"))
            postgis_version = postgis.scalar()
        return {
            "status": "healthy",
            "database": "connected",
            "postgis_version": postgis_version,
        }
    except Exception as e:
        logger.error("Database health check failed: %s", e)
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }
