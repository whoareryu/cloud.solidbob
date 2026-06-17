"""medical_record 아웃바운드 포트 — Repository ABC (DB SPI)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from medical_record.app.dtos.medical_record_dto import MedicalRecordResponse
from medical_record.domain.entities.blockchain_anchor_entity import BlockchainAnchor
from medical_record.domain.entities.medical_record_entity import MedicalRecord


class MedicalRecordRepository(ABC):
    @abstractmethod
    async def save_record(self, record: MedicalRecord) -> MedicalRecordResponse: ...

    @abstractmethod
    async def save_anchor(self, anchor: BlockchainAnchor) -> None: ...

    @abstractmethod
    async def find_record(self, record_id: str) -> MedicalRecord | None: ...

    @abstractmethod
    async def list_records_by_user(self, user_id: str) -> list[MedicalRecordResponse]: ...
