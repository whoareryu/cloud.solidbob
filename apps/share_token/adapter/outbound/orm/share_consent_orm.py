"""공유 동의(share_consents) ORM — 일회성 공유 토큰의 영속 기록."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class ShareConsentORM(Base):
    __tablename__ = "share_consents"

    share_id: Mapped[str] = uuid_pk("share_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    recipient_type: Mapped[str] = mapped_column(String(20), nullable=False)
    recipient_did: Mapped[str | None] = mapped_column(String(255), nullable=True)
    shared_items: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    disclosure_method: Mapped[str] = mapped_column(String(20), nullable=False, default="sd_jwt")
    redis_token_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="issued")
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
