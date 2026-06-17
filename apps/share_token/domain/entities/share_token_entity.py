"""일회성 공유 토큰(ShareToken) 도메인 엔티티 — 순수 파이썬."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

STATUS_ISSUED = "issued"
STATUS_USED = "used"
STATUS_EXPIRED = "expired"
STATUS_REVOKED = "revoked"


@dataclass
class ShareToken:
    """특정 의료 데이터 접근을 위한 일회성 공유 동의 애그리거트."""

    share_id: str
    user_id: str
    recipient_type: str
    recipient_did: str | None
    shared_items: list[Any]
    disclosure_method: str
    token_key: str
    status: str
    issued_at: datetime
    expires_at: datetime | None = None
    used_at: datetime | None = None
    extra: dict[str, Any] = field(default_factory=dict)

    def is_redeemable(self, now: datetime) -> bool:
        """현재 시점에 1회 사용 가능한 상태인지 판단한다."""
        if self.status != STATUS_ISSUED:
            return False
        if self.expires_at is not None and now >= self.expires_at:
            return False
        return True

    def mark_used(self, now: datetime) -> None:
        self.status = STATUS_USED
        self.used_at = now

    def revoke(self) -> None:
        self.status = STATUS_REVOKED
