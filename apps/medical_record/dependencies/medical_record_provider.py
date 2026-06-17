"""medical_record DI 팩토리 — PgRepository + BlockchainAdapter 조립 (DIP)."""

from __future__ import annotations

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from medical_record.adapter.outbound.blockchain_adapter import BlockchainAdapter
from medical_record.adapter.outbound.pg.medical_record_pg_repository import (
    MedicalRecordPgRepository,
)
from medical_record.app.ports.input.medical_record_use_case import MedicalRecordUseCase
from medical_record.app.ports.output.blockchain_port import BlockchainPort
from medical_record.app.ports.output.medical_record_repository import MedicalRecordRepository
from medical_record.app.use_cases.medical_record_interactor import MedicalRecordInteractor


def get_medical_record_repository(
    db: AsyncSession = Depends(get_db),
) -> MedicalRecordRepository:
    return MedicalRecordPgRepository(session=db)


def get_blockchain_port() -> BlockchainPort:
    return BlockchainAdapter()


def get_medical_record_use_case(
    repository: MedicalRecordRepository = Depends(get_medical_record_repository),
    blockchain: BlockchainPort = Depends(get_blockchain_port),
) -> MedicalRecordUseCase:
    return MedicalRecordInteractor(repository=repository, blockchain=blockchain)
