"""검증가능 자격증명(Verifiable Credential) 도메인 엔티티.

순수 파이썬 — 인프라/ORM/프레임워크 의존성 없음.
VC의 유효성 판단 같은 핵심 도메인 규칙을 캡슐화한다.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from identity.domain.value_objects.credential_subject_vo import CredentialSubject

STATUS_VALID = "valid"
STATUS_EXPIRED = "expired"
STATUS_REVOKED = "revoked"


@dataclass
class VerifiableCredential:
    """VC 애그리거트 루트."""

    vc_id: str
    holder_user_id: str
    type_code: str
    issuer_id: str | None
    subject: CredentialSubject
    status: str
    issued_at: datetime
    expires_at: datetime | None

    def is_expired(self, now: datetime) -> bool:
        """만료 시각이 지났는지 판단한다."""
        return self.expires_at is not None and now >= self.expires_at

    def is_active(self, now: datetime) -> bool:
        """현재 시점 기준으로 사용 가능한(유효한) VC인지 판단한다."""
        return self.status == STATUS_VALID and not self.is_expired(now)

    def revoke(self) -> None:
        """VC를 폐기 상태로 전이한다."""
        self.status = STATUS_REVOKED
