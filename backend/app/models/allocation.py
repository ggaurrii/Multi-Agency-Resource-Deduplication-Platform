"""
SAHAYOG — Allocation and AllocationItem models.

Allocation: master record for a matching result (PROPOSED → ACCEPTED/REJECTED).
AllocationItem: child rows specifying the per-resource split.

RESERVATION WORKFLOW (critical for concurrency safety):
    AVAILABLE quantity → RESERVED (on PROPOSED)
    RESERVED → IN_TRANSIT (on ACCEPTED)
    RESERVED → AVAILABLE (on REJECTED)

Resource quantity transitions MUST happen transactionally
using PostgreSQL row-level locking (SELECT ... FOR UPDATE).
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    need_id = Column(
        UUID(as_uuid=True),
        ForeignKey("needs.id", ondelete="CASCADE"),
        nullable=False,
    )
    status = Column(
        String(20),
        nullable=False,
        default="PROPOSED",
        comment="PROPOSED|ACCEPTED|MODIFIED|REJECTED",
    )
    authorized_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Nullable until authorized (FR-MAT-05)",
    )
    authorized_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    need = relationship("Need", back_populates="allocations")
    items = relationship(
        "AllocationItem",
        back_populates="allocation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    authorizer = relationship("User", foreign_keys=[authorized_by])

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_allocations_need_status", "need_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Allocation {self.id} need={self.need_id} status={self.status}>"


class AllocationItem(Base):
    __tablename__ = "allocation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    allocation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("allocations.id", ondelete="CASCADE"),
        nullable=False,
    )
    resource_id = Column(
        UUID(as_uuid=True),
        ForeignKey("resources.id", ondelete="CASCADE"),
        nullable=False,
    )
    quantity_allocated = Column(Numeric, nullable=False, comment="Per-resource split (FR-MAT-03)")
    distance_km = Column(Numeric, nullable=True, comment="PostGIS-computed distance")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    allocation = relationship("Allocation", back_populates="items")
    resource = relationship("Resource", back_populates="allocation_items")

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_alloc_items_resource", "resource_id"),
    )

    def __repr__(self) -> str:
        return f"<AllocationItem resource={self.resource_id} qty={self.quantity_allocated}>"
