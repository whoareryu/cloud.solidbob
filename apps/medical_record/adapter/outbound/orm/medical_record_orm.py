"""진료기록(medical_records) ORM — SHA-256 무결성 해시 보유."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import CHAR, Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class MedicalRecordORM(Base):
    __tablename__ = "medical_records"

    record_id: Mapped[str] = uuid_pk("record_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    institution_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("medical_institutions.institution_id"), nullable=True
    )
    category: Mapped[str] = mapped_column(String(20), nullable=False)
    fhir_resource_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    mongo_resource_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    integrity_hash: Mapped[str] = mapped_column(CHAR(64), nullable=False)
    visit_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
