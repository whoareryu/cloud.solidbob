"""share_token DI 팩토리 — PgRepository + RedisAdapter 조립 (DIP)."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from share_token.adapter.outbound.pg.share_token_pg_repository import ShareTokenPgRepository
from share_token.adapter.outbound.redis_adapter import RedisAdapter
from share_token.app.ports.input.share_token_use_case import ShareTokenUseCase
from share_token.app.ports.output.share_token_repository import ShareTokenRepository
from share_token.app.ports.output.token_store_port import TokenStorePort
from share_token.app.use_cases.share_token_interactor import ShareTokenInteractor


def get_share_token_repository(db: AsyncSession = Depends(get_db)) -> ShareTokenRepository:
    return ShareTokenPgRepository(session=db)


def get_token_store() -> TokenStorePort:
    return RedisAdapter()


def get_share_token_use_case(
    repository: ShareTokenRepository = Depends(get_share_token_repository),
    token_store: TokenStorePort = Depends(get_token_store),
) -> ShareTokenUseCase:
    return ShareTokenInteractor(repository=repository, token_store=token_store)
