"""ORM ↔ Domain/DTO 변환기 (medical_record)."""

from __future__ import annotations

from medical_record.adapter.outbound.orm.blockchain_anchor_orm import BlockchainAnchorORM
from medical_record.adapter.outbound.orm.medical_record_orm import MedicalRecordORM
from medical_record.app.dtos.medical_record_dto import MedicalRecordResponse
from medical_record.domain.entities.blockchain_anchor_entity import BlockchainAnchor
from medical_record.domain.entities.medical_record_entity import MedicalRecord
from medical_record.domain.value_objects.integrity_hash_vo import IntegrityHash
from medical_record.domain.value_objects.record_category_vo import RecordCategory


class MedicalRecordMapper:
    @staticmethod
    def record_to_orm(entity: MedicalRecord, command_extra: dict | None = None) -> MedicalRecordORM:
        extra = command_extra or {}
        return MedicalRecordORM(
            record_id=entity.record_id,
            user_id=entity.user_id,
            institution_id=entity.institution_id,
            category=str(entity.category),
            fhir_resource_type=extra.get("fhir_resource_type"),
            mongo_resource_id=extra.get("mongo_resource_id"),
            integrity_hash=entity.integrity_hash.value,
            visit_date=entity.visit_date,
            collected_at=entity.collected_at,
        )

    @staticmethod
    def orm_to_record(orm: MedicalRecordORM) -> MedicalRecord:
        return MedicalRecord(
            record_id=orm.record_id,
            user_id=orm.user_id,
            institution_id=orm.institution_id,
            category=RecordCategory(orm.category),
            integrity_hash=IntegrityHash(orm.integrity_hash),
            visit_date=orm.visit_date,
            collected_at=orm.collected_at,
        )

    @staticmethod
    def record_to_response(orm: MedicalRecordORM) -> MedicalRecordResponse:
        return MedicalRecordResponse(
            record_id=orm.record_id,
            user_id=orm.user_id,
            institution_id=orm.institution_id,
            category=orm.category,
            integrity_hash=orm.integrity_hash,
            visit_date=orm.visit_date,
            collected_at=orm.collected_at,
        )

    @staticmethod
    def anchor_to_orm(entity: BlockchainAnchor) -> BlockchainAnchorORM:
        return BlockchainAnchorORM(
            anchor_id=entity.anchor_id,
            record_id=entity.record_id,
            hash_value=entity.hash_value,
            chain_network=entity.chain_network,
            tx_hash=entity.tx_hash,
            block_number=entity.block_number,
            status=entity.status,
            anchored_at=entity.anchored_at,
        )
