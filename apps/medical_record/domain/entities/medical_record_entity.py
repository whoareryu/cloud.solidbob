"""진료기록(MedicalRecord) 도메인 엔티티 — 순수 파이썬."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from medical_record.domain.value_objects.integrity_hash_vo import IntegrityHash
from medical_record.domain.value_objects.record_category_vo import RecordCategory


@dataclass
class MedicalRecord:
    """진료기록 애그리거트 루트."""

    record_id: str
    user_id: str
    institution_id: str | None
    category: RecordCategory
    integrity_hash: IntegrityHash
    visit_date: date | None
    collected_at: datetime

    def verify_against(self, onchain_hash: str | None) -> bool:
        """온체인에 기록된 해시와 대조하여 위변조 여부를 판단한다.

        온체인 해시가 없으면(미앵커링) 검증 불가로 False.
        """
        if not onchain_hash:
            return False
        return self.integrity_hash.matches(IntegrityHash(onchain_hash))
