"""
SAHAYOG — RefreshToken model.

Server-side storage for JWT refresh tokens.
Stores only hashed tokens, never raw values.
Supports logout/revocation per NFR-SEC-03.
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    token_hash = Column(String(255), nullable=False, unique=True, comment="SHA-256 hash of the raw token")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True, comment="Set on logout/revocation")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # ── Indexes ──────────────────────────────────────────────
    __table_args__ = (
        Index("ix_refresh_tokens_user", "user_id"),
        Index("ix_refresh_tokens_hash", "token_hash", unique=True),
    )

    def __repr__(self) -> str:
        return f"<RefreshToken user={self.user_id} revoked={self.revoked_at is not None}>"
