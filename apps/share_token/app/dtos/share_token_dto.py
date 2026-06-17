"""share_token 유스케이스 내부 DTO."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class IssueShareTokenCommand:
    """일회성 공유 토큰 발급 입력."""

    user_id: str
    recipient_type: str
    shared_items: list[Any]
    ttl_seconds: int
    recipient_did: str | None = None
    disclosure_method: str = "sd_jwt"


@dataclass(frozen=True)
class RedeemShareTokenCommand:
    """공유 토큰 사용(검증+1회 소비) 입력."""

    token: str


@dataclass(frozen=True)
class ShareTokenResponse:
    share_id: str
    user_id: str
    recipient_type: str
    token: str
    status: str
    issued_at: datetime
    expires_at: datetime | None


@dataclass(frozen=True)
class RedeemResultResponse:
    share_id: str | None
    redeemed: bool
    shared_items: list[Any] = field(default_factory=list)
    reason: str = ""
