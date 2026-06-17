"""자격증명 타입 정의(credential_type_defs) ORM — JSON-LD @context 마스터."""

from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base


class CredentialTypeDefORM(Base):
    __tablename__ = "credential_type_defs"

    type_code: Mapped[str] = mapped_column(String(100), primary_key=True)
    context_url: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
