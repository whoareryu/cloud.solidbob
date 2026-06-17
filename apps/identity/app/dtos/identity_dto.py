"""identity 유스케이스 내부 DTO — Command / Query / Response (불변)."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(frozen=True)
class IssueCredentialCommand:
    """가족 건강 위임 VC 발급 입력."""

    holder_user_id: str          # VC 보유자(위임을 발급하는 회원)
    delegate_did: str            # 위임 대상(가족)의 DID — credentialSubject.id
    type_code: str               # 자격증명 타입 (credential_type_defs)
    issuer_id: str | None        # 신뢰 발급기관 (trusted_issuers)
    format: str = "sd_jwt_vc"
    expires_at: datetime | None = None
    claims: dict[str, Any] = field(default_factory=dict)  # 위임 범위 등


@dataclass(frozen=True)
class VerifyCredentialQuery:
    """VC 검증 입력."""

    vc_id: str


@dataclass(frozen=True)
class CredentialResponse:
    """VC 메타데이터 출력."""

    vc_id: str
    holder_user_id: str
    type_code: str
    issuer_id: str | None
    format: str
    status: str
    issued_at: datetime
    expires_at: datetime | None


@dataclass(frozen=True)
class VerificationResponse:
    """VC 검증 결과 출력."""

    vc_id: str
    valid: bool
    status: str
    reason: str
