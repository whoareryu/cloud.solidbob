"""진료기록 분류(RecordCategory) 밸류 오브젝트."""

from __future__ import annotations

from dataclasses import dataclass

ALLOWED_CATEGORIES: frozenset[str] = frozenset(
    {"diagnosis", "prescription", "lab_test", "checkup", "imaging"}
)


@dataclass(frozen=True)
class RecordCategory:
    value: str

    def __post_init__(self) -> None:
        if self.value not in ALLOWED_CATEGORIES:
            raise ValueError(
                f"허용되지 않은 진료기록 분류입니다: {self.value!r} "
                f"(허용: {sorted(ALLOWED_CATEGORIES)})"
            )

    def __str__(self) -> str:
        return self.value
