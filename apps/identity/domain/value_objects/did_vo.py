"""DID(Decentralized Identifier) 밸류 오브젝트 — W3C 규격을 가상 구현.

외부 라이브러리 의존성 없는 순수 파이썬 불변 객체.
``did:<method>:<method-specific-id>`` 형식을 강제한다.
"""

from __future__ import annotations

from dataclasses import dataclass

SUPPORTED_METHODS: tuple[str, ...] = ("key", "web", "ethr")


@dataclass(frozen=True)
class Did:
    """탈중앙 식별자 값 객체."""

    value: str

    def __post_init__(self) -> None:
        parts = self.value.split(":")
        if len(parts) < 3 or parts[0] != "did":
            raise ValueError(f"DID 형식이 올바르지 않습니다: {self.value!r}")
        if parts[1] not in SUPPORTED_METHODS:
            raise ValueError(f"지원하지 않는 DID method 입니다: {parts[1]!r}")
        if not parts[2]:
            raise ValueError("DID method-specific-id 가 비어 있습니다.")

    @property
    def method(self) -> str:
        """``did:<method>`` 형태의 메서드 토큰을 반환한다."""
        return f"did:{self.value.split(':')[1]}"

    def __str__(self) -> str:
        return self.value
