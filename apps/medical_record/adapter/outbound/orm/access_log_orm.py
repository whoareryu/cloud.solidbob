"""접근 로그(access_logs) ORM."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class AccessLogORM(Base):
    __tablename__ = "access_logs"

    log_id: Mapped[str] = uuid_pk("log_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    accessor_did: Mapped[str | None] = mapped_column(String(255), nullable=True)
    accessor_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    record_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("medical_records.record_id"), nullable=True
    )
    access_type: Mapped[str] = mapped_column(String(20), nullable=False)
    result: Mapped[str] = mapped_column(String(20), nullable=False, default="success")
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
