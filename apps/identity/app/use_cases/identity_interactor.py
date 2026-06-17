"""identity Interactor — IdentityUseCase 구현체.

비즈니스 흐름/정책만 제어한다. DB·인프라는 IdentityRepository 포트로만 접근하며
구현체를 직접 import 하지 않는다 (DIP).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from identity.app.dtos.identity_dto import (
    CredentialResponse,
    IssueCredentialCommand,
    VerificationResponse,
    VerifyCredentialQuery,
)
from identity.app.ports.input.identity_use_case import IdentityUseCase
from identity.app.ports.output.identity_repository import IdentityRepository
from identity.domain.entities.verifiable_credential_entity import (
    STATUS_VALID,
    VerifiableCredential,
)
from identity.domain.value_objects.credential_subject_vo import CredentialSubject
from identity.domain.value_objects.did_vo import Did


class IdentityInteractor(IdentityUseCase):
    def __init__(self, repository: IdentityRepository) -> None:
        self._repository = repository

    async def issue_credential(self, command: IssueCredentialCommand) -> CredentialResponse:
        # 위임 대상 DID는 도메인 VO가 W3C 형식을 검증한다.
        subject = CredentialSubject(
            subject_did=Did(command.delegate_did),
            claims=command.claims,
        )
        credential = VerifiableCredential(
            vc_id=str(uuid.uuid4()),
            holder_user_id=command.holder_user_id,
            type_code=command.type_code,
            issuer_id=command.issuer_id,
            subject=subject,
            status=STATUS_VALID,
            issued_at=datetime.now(timezone.utc),
            expires_at=command.expires_at,
        )
        return await self._repository.save(credential)

    async def verify_credential(self, query: VerifyCredentialQuery) -> VerificationResponse:
        credential = await self._repository.find_by_id(query.vc_id)
        if credential is None:
            return VerificationResponse(
                vc_id=query.vc_id, valid=False, status="unknown", reason="VC를 찾을 수 없습니다."
            )

        now = datetime.now(timezone.utc)
        if not credential.is_active(now):
            reason = "만료된 VC입니다." if credential.is_expired(now) else "유효하지 않은 상태의 VC입니다."
            return VerificationResponse(
                vc_id=credential.vc_id, valid=False, status=credential.status, reason=reason
            )

        if credential.issuer_id is not None:
            trusted = await self._repository.is_trusted_issuer(
                credential.issuer_id, credential.type_code
            )
            if not trusted:
                return VerificationResponse(
                    vc_id=credential.vc_id,
                    valid=False,
                    status=credential.status,
                    reason="신뢰할 수 없는 발급기관입니다.",
                )

        return VerificationResponse(
            vc_id=credential.vc_id, valid=True, status=credential.status, reason="검증 성공"
        )

    async def list_credentials(self, holder_user_id: str) -> list[CredentialResponse]:
        return await self._repository.list_by_holder(holder_user_id)

    async def revoke_credential(self, vc_id: str) -> CredentialResponse:
        from identity.domain.entities.verifiable_credential_entity import STATUS_REVOKED

        updated = await self._repository.update_status(vc_id, STATUS_REVOKED)
        if updated is None:
            raise ValueError("폐기할 VC를 찾을 수 없습니다.")
        return updated
