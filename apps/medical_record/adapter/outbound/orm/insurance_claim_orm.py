"""보험 청구(insurance_claims) ORM."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class InsuranceClaimORM(Base):
    __tablename__ = "insurance_claims"

    claim_id: Mapped[str] = uuid_pk("claim_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    partner_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("partners.partner_id"), nullable=True
    )
    claim_amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="submitted")
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
