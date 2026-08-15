"""
SAHAYOG — SQLAlchemy declarative base.

All ORM models inherit from this Base class.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """SQLAlchemy declarative base for all SAHAYOG models."""

    pass
