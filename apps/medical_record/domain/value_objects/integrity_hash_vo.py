"""무결성 해시(IntegrityHash) 밸류 오브젝트 — SHA-256 (64자리 hex).

순수 파이썬. 파일 바이트로부터 해시를 계산하는 팩토리를 제공하되,
표준 라이브러리(hashlib)만 사용하여 외부 인프라 의존을 만들지 않는다.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

_HEX64 = re.compile(r"^[0-9a-f]{64}$")


@dataclass(frozen=True)
class IntegrityHash:
    """SHA-256 무결성 해시 값."""

    value: str

    def __post_init__(self) -> None:
        normalized = self.value.lower()
        if not _HEX64.match(normalized):
            raise ValueError("SHA-256 해시는 64자리 16진수 문자열이어야 합니다.")
        object.__setattr__(self, "value", normalized)

    @classmethod
    def from_bytes(cls, payload: bytes) -> "IntegrityHash":
        """파일/문서 바이트로부터 SHA-256 해시를 생성한다."""
        return cls(hashlib.sha256(payload).hexdigest())

    def matches(self, other: "IntegrityHash") -> bool:
        return self.value == other.value

    def __str__(self) -> str:
        return self.value
