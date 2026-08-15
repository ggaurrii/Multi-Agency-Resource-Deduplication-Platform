"""
SAHAYOG — Resource model.

Physical resources held by agencies (boats, ambulances, generators, etc.)
with partial-allocation quantity tracking.

QUANTITY INVARIANT:
    quantity_available + quantity_reserved + quantity_in_transit <= quantity_total
    All quantity fields >= 0

This invariant is enforced by a PostgreSQL CHECK constraint.
"""

import uuid

from geoalchemy2 import Geography
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


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agency_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agencies.id", ondelete="CASCADE"),
        nullable=False,
        comment="Owning agency (FR-DED-02)",
    )
    district_id = Column(
        UUID(as_uuid=True),
        ForeignKey("districts.id", ondelete="CASCADE"),
        nullable=False,
    )
    resource_type = Column(
        String(40),
        nullable=False,
        comment="BOAT|AMBULANCE|GENERATOR|FOOD_PACKET|DRINKING_WATER (configurable)",
    )

    # ── Quantity sub-fields (partial allocation support) ─────
    quantity_total = Column(Numeric, nullable=False, comment="Total quantity owned")
    quantity_available = Column(Numeric, nullable=False, comment="Available for allocation")
    quantity_reserved = Column(
        Numeric, nullable=False, default=0, server_default="0",
        comment="Reserved by PROPOSED allocations",
    )
    quantity_in_transit = Column(
        Numeric, nullable=False, default=0, server_default="0",
        comment="Authorized and in transit",
    )
    unit = Column(String(30), nullable=False, default="units", comment="e.g. units, packets, liters")

    # ── Location ─────────────────────────────────────────────
    location = Column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=True,
        comment="PostGIS point for distance ranking (FR-MAT-02)",
    )

    # ── Status & lifecycle ───────────────────────────────────
    status = Column(
        String(20),
        nullable=False,
        default="AVAILABLE",
        comment="AVAILABLE|DEPLOYED|IN_TRANSIT|RESERVED|DAMAGED|EXPIRED",
    )
    expiry = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    agency = relationship("Agency", back_populates="resources")
    district = relationship("District", back_populates="resources")
    allocation_items = relationship("AllocationItem", back_populates="resource", lazy="selectin")

    # ── Constraints & Indexes ────────────────────────────────
    __table_args__ = (
        # Quantity invariant: all >= 0 and sum <= total
        CheckConstraint("quantity_total >= 0", name="ck_resource_qty_total_non_negative"),
        CheckConstraint("quantity_available >= 0", name="ck_resource_qty_available_non_negative"),
        CheckConstraint("quantity_reserved >= 0", name="ck_resource_qty_reserved_non_negative"),
        CheckConstraint("quantity_in_transit >= 0", name="ck_resource_qty_in_transit_non_negative"),
        CheckConstraint(
            "quantity_available + quantity_reserved + quantity_in_transit <= quantity_total",
            name="ck_resource_qty_invariant",
        ),
        # Composite indexes for common queries
        Index("ix_resources_district_type", "district_id", "resource_type"),
        Index("ix_resources_agency_type", "agency_id", "resource_type"),
        Index("ix_resources_type_status", "resource_type", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Resource {self.resource_type} agency={self.agency_id} "
            f"avail={self.quantity_available}/{self.quantity_total}>"
        )
