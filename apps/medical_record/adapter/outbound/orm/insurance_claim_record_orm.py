"""보험 청구-진료기록 연결(insurance_claim_records) ORM — 복합 PK."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base


class InsuranceClaimRecordORM(Base):
    __tablename__ = "insurance_claim_records"

    claim_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("insurance_claims.claim_id"), primary_key=True
    )
    record_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("medical_records.record_id"), primary_key=True
    )
