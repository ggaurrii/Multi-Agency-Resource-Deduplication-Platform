"""
SAHAYOG — District model.

Represents a geographic administrative district with PostGIS geometry.
"""

import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, default="Rajasthan")
    geometry = Column(
        Geometry(geometry_type="POLYGON", srid=4326, spatial_index=True),
        nullable=True,
        comment="PostGIS boundary polygon for the district",
    )
    centroid_lat = Column(Float, nullable=True, comment="Centroid latitude for quick lookups")
    centroid_lng = Column(Float, nullable=True, comment="Centroid longitude for quick lookups")
    affected_population = Column(Integer, nullable=True, comment="Used by forecasting module")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Relationships ────────────────────────────────────────
    resources = relationship("Resource", back_populates="district", lazy="selectin")
    needs = relationship("Need", back_populates="district", lazy="selectin")

    def __repr__(self) -> str:
        return f"<District {self.name}, {self.state}>"
