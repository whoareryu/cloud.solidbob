"""identity DI 팩토리 — 구현체 조립은 여기서만 한다 (DIP)."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from identity.adapter.outbound.pg.identity_pg_repository import IdentityPgRepository
from identity.app.ports.input.identity_use_case import IdentityUseCase
from identity.app.ports.output.identity_repository import IdentityRepository
from identity.app.use_cases.identity_interactor import IdentityInteractor


def get_identity_repository(db: AsyncSession = Depends(get_db)) -> IdentityRepository:
    return IdentityPgRepository(session=db)


def get_identity_use_case(
    repository: IdentityRepository = Depends(get_identity_repository),
) -> IdentityUseCase:
    return IdentityInteractor(repository=repository)
