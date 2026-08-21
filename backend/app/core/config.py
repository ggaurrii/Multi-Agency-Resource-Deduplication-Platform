"""
SAHAYOG — Application configuration.

Loads settings from environment variables via pydantic-settings.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Application ──────────────────────────────────────────
    app_name: str = "SAHAYOG"
    app_version: str = "0.1.0"
    debug: bool = False
    log_level: str = "INFO"

    # ── Database ─────────────────────────────────────────────
    postgres_user: str = "sahayog"
    postgres_password: str = "sahayog_dev_password"
    postgres_db: str = "sahayog"
    postgres_host: str = "db"
    postgres_port: int = 5432
    database_url: str = "postgresql+asyncpg://sahayog:sahayog_dev_password@db:5432/sahayog"
    database_url_sync: str = "postgresql+psycopg2://sahayog:sahayog_dev_password@db:5432/sahayog"

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_async_db_url(cls, v: str | None) -> str:
        if not v:
            return "postgresql+asyncpg://sahayog:sahayog_dev_password@db:5432/sahayog"
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://") and not v.startswith("postgresql+"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("database_url_sync", mode="before")
    @classmethod
    def assemble_sync_db_url(cls, v: str | None) -> str:
        if not v:
            return "postgresql+psycopg2://sahayog:sahayog_dev_password@db:5432/sahayog"
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+psycopg2://", 1)
        if v.startswith("postgresql://") and not v.startswith("postgresql+"):
            return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    # ── JWT ──────────────────────────────────────────────────
    jwt_secret_key: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()

