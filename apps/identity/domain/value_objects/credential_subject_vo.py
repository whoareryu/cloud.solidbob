"""자격증명 주체(credentialSubject) 밸류 오브젝트.

W3C VC 데이터 모델의 ``credentialSubject`` 를 가상 구현한다.
가족 건강 위임의 경우 위임 대상(가족)의 DID와 위임 범위(claims)를 담는다.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Any, Mapping

from identity.domain.value_objects.did_vo import Did


@dataclass(frozen=True)
class CredentialSubject:
    """자격증명이 기술하는 주체와 주장(claims)."""

    subject_did: Did
    claims: Mapping[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        # 불변성 보장: 외부에서 전달된 dict를 읽기 전용 뷰로 고정한다.
        object.__setattr__(self, "claims", MappingProxyType(dict(self.claims)))

    def to_dict(self) -> dict[str, Any]:
        return {"id": str(self.subject_did), **dict(self.claims)}
