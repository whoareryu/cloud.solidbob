"""Redis 아웃바운드 어댑터 — TokenStorePort 구현 (redis-py).

일회성 공유 토큰을 SETEX(TTL)로 저장하고, 사용 시 원자적 GETDEL로 1회만 소비한다.
redis 미설치 또는 미연결 시 인메모리 폴백으로 graceful degradation 한다.
"""

from __future__ import annotations

import logging
import os
import time

from share_token.app.ports.output.token_store_port import TokenStorePort

logger = logging.getLogger(__name__)

_KEY_PREFIX = "vitalink:share_token:"


class RedisAdapter(TokenStorePort):
    """redis-py 기반 일회성 토큰 저장소."""

    # 폴백 인메모리 저장소: {token: (share_id, expires_epoch)}. 인스턴스 간 공유.
    _fallback: dict[str, tuple[str, float]] = {}

    def __init__(self, redis_url: str | None = None) -> None:
        self._redis_url = redis_url or os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
        self._client = None

    def _get_client(self):
        """redis 클라이언트를 지연 초기화한다. 실패 시 None (폴백 사용)."""
        if self._client is not None:
            return self._client
        try:
            import redis.asyncio as aioredis  # 지연 import

            self._client = aioredis.from_url(self._redis_url, decode_responses=True)
            return self._client
        except Exception:
            logger.warning("redis 초기화 실패 — 인메모리 폴백 사용", exc_info=True)
            return None

    @staticmethod
    def _key(token: str) -> str:
        return f"{_KEY_PREFIX}{token}"

    async def save(self, token: str, share_id: str, ttl_seconds: int) -> None:
        client = self._get_client()
        if client is not None:
            try:
                await client.setex(self._key(token), ttl_seconds, share_id)
                return
            except Exception:
                logger.warning("redis setex 실패 — 폴백", exc_info=True)
        self._fallback[token] = (share_id, time.time() + ttl_seconds)

    async def consume(self, token: str) -> str | None:
        client = self._get_client()
        if client is not None:
            try:
                # GETDEL: 원자적 조회+삭제로 일회성 보장
                return await client.getdel(self._key(token))
            except Exception:
                logger.warning("redis getdel 실패 — 폴백", exc_info=True)
        entry = self._fallback.pop(token, None)
        if entry is None:
            return None
        share_id, expires_epoch = entry
        if time.time() >= expires_epoch:
            return None
        return share_id

    async def delete(self, token: str) -> None:
        client = self._get_client()
        if client is not None:
            try:
                await client.delete(self._key(token))
                return
            except Exception:
                logger.warning("redis delete 실패 — 폴백", exc_info=True)
        self._fallback.pop(token, None)
