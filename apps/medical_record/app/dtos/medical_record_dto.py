"""medical_record 유스케이스 내부 DTO."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime


@dataclass(frozen=True)
class CreateMedicalRecordCommand:
    """의료 데이터 생성 입력. 파일 바이트로부터 해시를 추출해 앵커링한다."""

    user_id: str
    institution_id: str | None
    category: str
    payload: bytes                      # 해시 대상 원본 바이트 (FHIR/문서)
    chain_network: str
    fhir_resource_type: str | None = None
    mongo_resource_id: str | None = None
    visit_date: date | None = None


@dataclass(frozen=True)
class VerifyMedicalRecordQuery:
    record_id: str


@dataclass(frozen=True)
class MedicalRecordResponse:
    record_id: str
    user_id: str
    institution_id: str | None
    category: str
    integrity_hash: str
    visit_date: date | None
    collected_at: datetime


@dataclass(frozen=True)
class AnchorResponse:
    anchor_id: str
    record_id: str
    hash_value: str
    chain_network: str
    tx_hash: str | None
    block_number: int | None
    status: str


@dataclass(frozen=True)
class RecordVerificationResponse:
    record_id: str
    verified: bool
    stored_hash: str
    onchain_hash: str | None
    reason: str
