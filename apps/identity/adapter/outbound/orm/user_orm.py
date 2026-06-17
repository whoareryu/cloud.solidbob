"""회원(users) ORM — Open DID 보유 주체."""

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import Date, DateTime, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class UserORM(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = uuid_pk("user_id")
    did: Mapped[str] = mapped_column(String(255), nullable=False)
    did_method: Mapped[str] = mapped_column(String(20), nullable=False, default="did:web")
    name_enc: Mapped[bytes] = mapped_column(LargeBinary(255), nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    phone_enc: Mapped[bytes | None] = mapped_column(LargeBinary(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False
    )
