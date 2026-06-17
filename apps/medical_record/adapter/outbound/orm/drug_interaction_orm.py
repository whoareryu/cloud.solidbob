"""약물 상호작용(drug_interactions) ORM — 복합 PK."""

from __future__ import annotations

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base


class DrugInteractionORM(Base):
    __tablename__ = "drug_interactions"

    drug_code_a: Mapped[str] = mapped_column(
        String(50), ForeignKey("drugs.drug_code"), primary_key=True
    )
    drug_code_b: Mapped[str] = mapped_column(
        String(50), ForeignKey("drugs.drug_code"), primary_key=True
    )
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
