"""블록체인 앵커(blockchain_anchors) ORM — 온체인 해시 기록 상태."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import CHAR, BigInteger, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.matrix.grid_neo_theone_base import Base, _utcnow, uuid_pk


class BlockchainAnchorORM(Base):
    __tablename__ = "blockchain_anchors"

    anchor_id: Mapped[str] = uuid_pk("anchor_id")
    record_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("medical_records.record_id"), nullable=False, index=True
    )
    hash_value: Mapped[str] = mapped_column(CHAR(64), nullable=False)
    chain_network: Mapped[str] = mapped_column(
        String(30), ForeignKey("chain_configs.chain_network"), nullable=False
    )
    tx_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    block_number: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    anchored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
