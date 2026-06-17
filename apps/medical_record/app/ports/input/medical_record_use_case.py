"""medical_record 인바운드 포트 — UseCase ABC."""

from __future__ import annotations

from abc import ABC, abstractmethod

from medical_record.app.dtos.medical_record_dto import (
    CreateMedicalRecordCommand,
    MedicalRecordResponse,
    RecordVerificationResponse,
    VerifyMedicalRecordQuery,
)


class MedicalRecordUseCase(ABC):
    """의료 데이터 + 블록체인 무결성 검증 유스케이스 계약."""

    @abstractmethod
    async def create_record(self, command: CreateMedicalRecordCommand) -> MedicalRecordResponse: ...

    @abstractmethod
    async def verify_record(self, query: VerifyMedicalRecordQuery) -> RecordVerificationResponse: ...

    @abstractmethod
    async def get_record(self, record_id: str) -> MedicalRecordResponse: ...

    @abstractmethod
    async def list_records(self, user_id: str) -> list[MedicalRecordResponse]: ...
