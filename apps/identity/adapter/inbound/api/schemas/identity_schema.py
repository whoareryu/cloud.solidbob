"""identity HTTP 경계 Pydantic 스키마."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class IssueCredentialSchema(BaseModel):
    """가족 건강 위임 VC 발급 요청."""

    holder_user_id: str = Field(..., description="VC 보유자(위임 발급 회원) ID")
    delegate_did: str = Field(..., description="위임 대상(가족) DID, 예: did:web:family-member")
    type_code: str = Field(..., description="자격증명 타입 코드")
    issuer_id: str | None = Field(None, description="신뢰 발급기관 ID")
    format: str = Field("sd_jwt_vc", description="VC 포맷")
    expires_at: datetime | None = Field(None, description="만료 시각")
    claims: dict[str, Any] = Field(default_factory=dict, description="위임 범위 등 주장")

    model_config = {
        "json_schema_extra": {
            "example": {
                "holder_user_id": "11111111-1111-1111-1111-111111111111",
                "delegate_did": "did:web:daughter.example.com",
                "type_code": "FamilyHealthDelegation",
                "issuer_id": None,
                "format": "sd_jwt_vc",
                "expires_at": "2026-12-31T23:59:59Z",
                "claims": {"scope": ["read:records", "share:records"]},
            }
        }
    }


class CredentialResponseSchema(BaseModel):
    vc_id: str
    holder_user_id: str
    type_code: str
    issuer_id: str | None
    format: str
    status: str
    issued_at: datetime
    expires_at: datetime | None


class VerificationResponseSchema(BaseModel):
    vc_id: str
    valid: bool
    status: str
    reason: str
