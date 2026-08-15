"""
SAHAYOG — Alembic migration environment.

Configures the database URL from environment variables and loads
all SQLAlchemy models for autogenerate support.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import get_settings
from app.db.base import Base

# Import all models so Alembic can detect them for autogenerate
import app.models  # noqa: F401

# ── Alembic Config ───────────────────────────────────────────
config = context.config

# Load logging config from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the target metadata for autogenerate
target_metadata = Base.metadata

# Override sqlalchemy.url from environment
settings = get_settings()
config.set_main_option("sqlalchemy.url", settings.database_url_sync)


def include_name(name, type_, parent_names):
    """Filter out PostGIS internal tables from autogenerate."""
    if type_ == "table" and name in ("spatial_ref_sys",):
        return False
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    Generates SQL script without connecting to the database.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_name=include_name,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    Creates an Engine and connects to the database.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_name=include_name,
            render_as_batch=False,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
