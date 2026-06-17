"""토큰 스토어 아웃바운드 포트(SPI) — TokenStorePort ABC.

Redis 같은 인프라 타입을 노출하지 않는다. 일회성 토큰의 저장(TTL)·소비·조회만 추상화한다.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class TokenStorePort(ABC):
    @abstractmethod
    async def save(self, token: str, share_id: str, ttl_seconds: int) -> None:
        """토큰을 TTL과 함께 저장한다 (만료 시 자동 파기)."""
        ...

    @abstractmethod
    async def consume(self, token: str) -> str | None:
        """토큰을 1회성으로 조회·삭제한다. 존재하면 share_id, 없으면 None."""
        ...

    @abstractmethod
    async def delete(self, token: str) -> None:
        """토큰을 즉시 파기한다 (revoke)."""
        ...
