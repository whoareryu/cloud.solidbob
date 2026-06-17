"""체인 설정(chain_configs) ORM — 앵커 컨트랙트 메타."""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base


class ChainConfigORM(Base):
    __tablename__ = "chain_configs"

    chain_network: Mapped[str] = mapped_column(String(30), primary_key=True)
    default_method: Mapped[str] = mapped_column(String(20), nullable=False, default="smart_contract")
    contract_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    explorer_base_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
