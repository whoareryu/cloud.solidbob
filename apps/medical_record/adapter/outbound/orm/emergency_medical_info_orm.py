"""응급 의료정보(emergency_medical_info) ORM — users와 1:1."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow


class EmergencyMedicalInfoORM(Base):
    __tablename__ = "emergency_medical_info"

    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.user_id"), primary_key=True
    )
    blood_type: Mapped[str | None] = mapped_column(String(8), nullable=True)
    allergies: Mapped[list | None] = mapped_column(JSON, nullable=True)
    chronic_conditions: Mapped[list | None] = mapped_column(JSON, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
