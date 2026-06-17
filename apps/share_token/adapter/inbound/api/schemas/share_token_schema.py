"""share_token HTTP 경계 Pydantic 스키마."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class IssueShareTokenSchema(BaseModel):
    """일회성 공유 토큰 발급 요청."""

    user_id: str = Field(..., description="데이터 주인(회원) ID")
    recipient_type: str = Field(..., description="doctor|insurer|hospital|pharmacy|government")
    shared_items: list[Any] = Field(..., description="공유 항목 목록")
    ttl_seconds: int = Field(..., ge=1, le=86400, description="만료 시간(초), 최대 24시간")
    recipient_did: str | None = Field(None, description="수신자 DID")
    disclosure_method: str = Field("sd_jwt", description="full|sd_jwt|bbs_plus|zkp")


class RedeemShareTokenSchema(BaseModel):
    token: str = Field(..., description="발급받은 일회성 토큰")


class ShareTokenResponseSchema(BaseModel):
    share_id: str
    user_id: str
    recipient_type: str
    token: str
    status: str
    issued_at: datetime
    expires_at: datetime | None


class RedeemResultResponseSchema(BaseModel):
    share_id: str | None
    redeemed: bool
    shared_items: list[Any]
    reason: str
