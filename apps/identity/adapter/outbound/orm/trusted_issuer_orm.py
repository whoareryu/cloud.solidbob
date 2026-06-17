"""신뢰 발급기관(trusted_issuers) ORM."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class TrustedIssuerORM(Base):
    __tablename__ = "trusted_issuers"

    issuer_id: Mapped[str] = uuid_pk("issuer_id")
    issuer_did: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    did_method: Mapped[str] = mapped_column(String(20), nullable=False)
    credential_types: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )
