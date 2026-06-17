"""ORM ↔ Domain/DTO 변환기 (identity)."""

from __future__ import annotations

from identity.adapter.outbound.orm.verifiable_credential_orm import VerifiableCredentialORM
from identity.app.dtos.identity_dto import CredentialResponse
from identity.domain.entities.verifiable_credential_entity import VerifiableCredential
from identity.domain.value_objects.credential_subject_vo import CredentialSubject
from identity.domain.value_objects.did_vo import Did


class IdentityMapper:
    @staticmethod
    def entity_to_orm(entity: VerifiableCredential) -> VerifiableCredentialORM:
        return VerifiableCredentialORM(
            vc_id=entity.vc_id,
            user_id=entity.holder_user_id,
            type_code=entity.type_code,
            issuer_id=entity.issuer_id,
            format="sd_jwt_vc",
            status=entity.status,
            issued_at=entity.issued_at,
            expires_at=entity.expires_at,
        )

    @staticmethod
    def orm_to_entity(orm: VerifiableCredentialORM) -> VerifiableCredential:
        # ORM에는 credentialSubject 원본이 없으므로(mongo 참조) 보유자 DID로 최소 복원한다.
        subject = CredentialSubject(subject_did=Did(f"did:web:{orm.user_id}"))
        return VerifiableCredential(
            vc_id=orm.vc_id,
            holder_user_id=orm.user_id,
            type_code=orm.type_code,
            issuer_id=orm.issuer_id,
            subject=subject,
            status=orm.status,
            issued_at=orm.issued_at,
            expires_at=orm.expires_at,
        )

    @staticmethod
    def orm_to_response(orm: VerifiableCredentialORM) -> CredentialResponse:
        return CredentialResponse(
            vc_id=orm.vc_id,
            holder_user_id=orm.user_id,
            type_code=orm.type_code,
            issuer_id=orm.issuer_id,
            format=orm.format,
            status=orm.status,
            issued_at=orm.issued_at,
            expires_at=orm.expires_at,
        )
