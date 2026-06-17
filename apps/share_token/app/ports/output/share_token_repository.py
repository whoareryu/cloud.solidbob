"""share_token 아웃바운드 포트 — Repository ABC (DB SPI, share_consents)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from share_token.domain.entities.share_token_entity import ShareToken


class ShareTokenRepository(ABC):
    @abstractmethod
    async def save(self, token: ShareToken) -> ShareToken: ...

    @abstractmethod
    async def find_by_id(self, share_id: str) -> ShareToken | None: ...

    @abstractmethod
    async def update(self, token: ShareToken) -> ShareToken: ...
