"""처방(prescriptions) ORM."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class PrescriptionORM(Base):
    __tablename__ = "prescriptions"

    prescription_id: Mapped[str] = uuid_pk("prescription_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    record_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("medical_records.record_id"), nullable=True
    )
    institution_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("medical_institutions.institution_id"), nullable=True
    )
    drug_code: Mapped[str] = mapped_column(String(50), ForeignKey("drugs.drug_code"), nullable=False)
    dosage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    duration_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    prescribed_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
