"""
SAHAYOG — Need model.

Represents a district-level requirement for a resource type.
Priority is automatically derived from the deadline field.
"""

import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Need(Base):
    __tablename__ = "needs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    district_id = Column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False,
    )
    resource_type = Column(String(40), nullable=False, comment="Matches resource.resource_type domain")
    quantity_needed = Column(Numeric, nullable=False, comment="Total quantity required")
    quantity_fulfilled = Column(
        Numeric, nullable=False, default=0, server_default="0",
        comment="Updated as allocations are accepted",
    )
    priority = Column(
        String(10),
        nullable=False,
        comment="CRITICAL|HIGH|MEDIUM|LOW — auto-derived from deadline (FR-PRI-01)",
    )
    deadline = Column(DateTime(timezone=True), nullable=False, comment="Drives priority derivation")
    status = Column(
        String(20),
        nullable=False,
        default="OPEN",
        comment="OPEN|PARTIALLY_MET|RESOLVED|EXPIRED",
    )
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    district = relationship("District", back_populates="needs")
    allocations = relationship("Allocation", back_populates="need", lazy="selectin")
    creator = relationship("User", foreign_keys=[created_by])

    # ── Constraints & Indexes ────────────────────────────────
    __table_args__ = (
        CheckConstraint("quantity_needed > 0", name="ck_need_qty_positive"),
        CheckConstraint("quantity_fulfilled >= 0", name="ck_need_qty_fulfilled_non_negative"),
        Index("ix_needs_district_type", "district_id", "resource_type"),
        Index("ix_needs_status_priority", "status", "priority"),
    )

    def __repr__(self) -> str:
        return (
            f"<Need {self.resource_type} qty={self.quantity_fulfilled}/{self.quantity_needed} "
            f"priority={self.priority} status={self.status}>"
        )
