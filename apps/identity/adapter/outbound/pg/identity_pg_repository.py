"""identity Repository 구현체 — PostgreSQL(AsyncSession)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from identity.adapter.outbound.mappers.identity_mapper import IdentityMapper
from identity.adapter.outbound.orm.trusted_issuer_orm import TrustedIssuerORM
from identity.adapter.outbound.orm.verifiable_credential_orm import VerifiableCredentialORM
from identity.app.dtos.identity_dto import CredentialResponse
from identity.app.ports.output.identity_repository import IdentityRepository
from identity.domain.entities.verifiable_credential_entity import VerifiableCredential


class IdentityPgRepository(IdentityRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, credential: VerifiableCredential) -> CredentialResponse:
        orm = IdentityMapper.entity_to_orm(credential)
        self._session.add(orm)
        await self._session.flush()
        return IdentityMapper.orm_to_response(orm)

    async def find_by_id(self, vc_id: str) -> VerifiableCredential | None:
        orm = await self._session.get(VerifiableCredentialORM, vc_id)
        return IdentityMapper.orm_to_entity(orm) if orm is not None else None

    async def list_by_holder(self, holder_user_id: str) -> list[CredentialResponse]:
        rows = await self._session.scalars(
            select(VerifiableCredentialORM)
            .where(VerifiableCredentialORM.user_id == holder_user_id)
            .order_by(VerifiableCredentialORM.issued_at.desc())
        )
        return [IdentityMapper.orm_to_response(orm) for orm in rows.all()]

    async def update_status(self, vc_id: str, status: str) -> CredentialResponse | None:
        orm = await self._session.get(VerifiableCredentialORM, vc_id)
        if orm is None:
            return None
        orm.status = status
        await self._session.flush()
        return IdentityMapper.orm_to_response(orm)

    async def is_trusted_issuer(self, issuer_id: str, type_code: str) -> bool:
        orm = await self._session.get(TrustedIssuerORM, issuer_id)
        if orm is None or not orm.is_active:
            return False
        types = orm.credential_types or []
        # 역정규화된 발급가능 타입 목록에 포함되면 신뢰한다 (목록이 비어있으면 전체 허용).
        return not types or type_code in types
