"""검증가능 자격증명(verifiable_credentials) ORM — VC 메타데이터."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class VerifiableCredentialORM(Base):
    __tablename__ = "verifiable_credentials"

    vc_id: Mapped[str] = uuid_pk("vc_id")
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    type_code: Mapped[str] = mapped_column(
        String(100), ForeignKey("credential_type_defs.type_code"), nullable=False
    )
    issuer_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("trusted_issuers.issuer_id"), nullable=True
    )
    format: Mapped[str] = mapped_column(String(20), nullable=False, default="sd_jwt_vc")
    mongo_doc_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="valid")
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
