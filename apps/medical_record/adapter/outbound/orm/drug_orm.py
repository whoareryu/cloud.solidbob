"""의약품(drugs) ORM — 표준코드 마스터."""

from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base


class DrugORM(Base):
    __tablename__ = "drugs"

    drug_code: Mapped[str] = mapped_column(String(50), primary_key=True)
    drug_name: Mapped[str] = mapped_column(String(255), nullable=False)
    atc_class: Mapped[str | None] = mapped_column(String(20), nullable=True)
    form: Mapped[str | None] = mapped_column(String(50), nullable=True)
