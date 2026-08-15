"""
SAHAYOG — Agency model.

Represents an organization participating in disaster relief
(NDRF, Army, NGO, State Authority, etc.).
"""

import uuid

from sqlalchemy import Column, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    type = Column(String(40), nullable=False, comment="NDRF|ARMY|SDRF|NGO|HOSPITAL|STATE_AUTHORITY")
    contact_info = Column(JSONB, nullable=True, comment="phone, email, address")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    users = relationship("User", back_populates="agency", lazy="selectin")
    resources = relationship("Resource", back_populates="agency", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Agency {self.name} ({self.type})>"
