"""블록체인 앵커(BlockchainAnchor) 도메인 엔티티 — 순수 파이썬."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

STATUS_PENDING = "pending"
STATUS_ANCHORED = "anchored"
STATUS_FAILED = "failed"


@dataclass
class BlockchainAnchor:
    """진료기록 해시의 온체인 앵커링 상태."""

    anchor_id: str
    record_id: str
    hash_value: str
    chain_network: str
    tx_hash: str | None = None
    block_number: int | None = None
    status: str = STATUS_PENDING
    anchored_at: datetime | None = None

    def mark_anchored(self, tx_hash: str, block_number: int, anchored_at: datetime) -> None:
        """온체인 기록 완료 상태로 전이한다."""
        self.tx_hash = tx_hash
        self.block_number = block_number
        self.anchored_at = anchored_at
        self.status = STATUS_ANCHORED

    def mark_failed(self) -> None:
        self.status = STATUS_FAILED

    @property
    def is_anchored(self) -> bool:
        return self.status == STATUS_ANCHORED
