"""medical_record Repository 구현체 — PostgreSQL(AsyncSession)."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from medical_record.adapter.outbound.mappers.medical_record_mapper import MedicalRecordMapper
from medical_record.adapter.outbound.orm.medical_record_orm import MedicalRecordORM
from medical_record.app.dtos.medical_record_dto import MedicalRecordResponse
from medical_record.app.ports.output.medical_record_repository import MedicalRecordRepository
from medical_record.domain.entities.blockchain_anchor_entity import BlockchainAnchor
from medical_record.domain.entities.medical_record_entity import MedicalRecord


class MedicalRecordPgRepository(MedicalRecordRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save_record(self, record: MedicalRecord) -> MedicalRecordResponse:
        orm = MedicalRecordMapper.record_to_orm(record)
        self._session.add(orm)
        await self._session.flush()
        return MedicalRecordMapper.record_to_response(orm)

    async def save_anchor(self, anchor: BlockchainAnchor) -> None:
        self._session.add(MedicalRecordMapper.anchor_to_orm(anchor))
        await self._session.flush()

    async def find_record(self, record_id: str) -> MedicalRecord | None:
        orm = await self._session.get(MedicalRecordORM, record_id)
        return MedicalRecordMapper.orm_to_record(orm) if orm is not None else None

    async def list_records_by_user(self, user_id: str) -> list[MedicalRecordResponse]:
        rows = await self._session.scalars(
            select(MedicalRecordORM)
            .where(MedicalRecordORM.user_id == user_id)
            .order_by(MedicalRecordORM.collected_at.desc())
        )
        return [MedicalRecordMapper.record_to_response(orm) for orm in rows.all()]
