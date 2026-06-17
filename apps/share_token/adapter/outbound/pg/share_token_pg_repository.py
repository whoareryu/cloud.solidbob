"""share_token Repository 구현체 — PostgreSQL(AsyncSession), share_consents."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from share_token.adapter.outbound.mappers.share_token_mapper import ShareTokenMapper
from share_token.adapter.outbound.orm.share_consent_orm import ShareConsentORM
from share_token.app.ports.output.share_token_repository import ShareTokenRepository
from share_token.domain.entities.share_token_entity import ShareToken


class ShareTokenPgRepository(ShareTokenRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, token: ShareToken) -> ShareToken:
        orm = ShareTokenMapper.entity_to_orm(token)
        self._session.add(orm)
        await self._session.flush()
        return ShareTokenMapper.orm_to_entity(orm)

    async def find_by_id(self, share_id: str) -> ShareToken | None:
        orm = await self._session.get(ShareConsentORM, share_id)
        return ShareTokenMapper.orm_to_entity(orm) if orm is not None else None

    async def update(self, token: ShareToken) -> ShareToken:
        orm = await self._session.get(ShareConsentORM, token.share_id)
        if orm is None:
            raise ValueError("업데이트할 공유 동의 기록을 찾을 수 없습니다.")
        ShareTokenMapper.apply_to_orm(token, orm)
        await self._session.flush()
        return ShareTokenMapper.orm_to_entity(orm)
