"""토큰 만료시간(TokenTtl) 밸류 오브젝트 — 초 단위, 순수 파이썬."""

from __future__ import annotations

from dataclasses import dataclass

_MAX_TTL_SECONDS = 24 * 60 * 60  # 일회성 공유 토큰 최대 24시간


@dataclass(frozen=True)
class TokenTtl:
    seconds: int

    def __post_init__(self) -> None:
        if self.seconds <= 0:
            raise ValueError("TTL은 1초 이상이어야 합니다.")
        if self.seconds > _MAX_TTL_SECONDS:
            raise ValueError(f"TTL은 최대 {_MAX_TTL_SECONDS}초(24시간)까지 허용됩니다.")
