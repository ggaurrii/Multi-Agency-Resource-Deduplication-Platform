"""
SAHAYOG — User model.

Authenticated users belonging to agencies, with role-based access control.
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agency_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agencies.id", ondelete="SET NULL"),
        nullable=True,
        comment="Nullable for SUPER_ADMIN who are not agency-scoped",
    )
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    role = Column(
        String(30),
        nullable=False,
        comment="SUPER_ADMIN|STATE_OPERATOR|AGENCY_ADMIN|AGENCY_STAFF",
    )
    password_hash = Column(String(255), nullable=False, comment="bcrypt hash, never plaintext")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    agency = relationship("Agency", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user", lazy="dynamic")

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_users_agency_role", "agency_id", "role"),
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
