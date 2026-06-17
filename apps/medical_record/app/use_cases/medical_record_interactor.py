"""medical_record Interactor — MedicalRecordUseCase 구현체.

흐름 제어만 담당한다. DB는 MedicalRecordRepository, 블록체인은 BlockchainPort
추상에만 의존하며 구현체(blockchain_adapter)를 직접 import 하지 않는다 (DIP).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from medical_record.app.dtos.medical_record_dto import (
    CreateMedicalRecordCommand,
    MedicalRecordResponse,
    RecordVerificationResponse,
    VerifyMedicalRecordQuery,
)
from medical_record.app.ports.input.medical_record_use_case import MedicalRecordUseCase
from medical_record.app.ports.output.blockchain_port import BlockchainPort
from medical_record.app.ports.output.medical_record_repository import MedicalRecordRepository
from medical_record.domain.entities.blockchain_anchor_entity import BlockchainAnchor
from medical_record.domain.entities.medical_record_entity import MedicalRecord
from medical_record.domain.value_objects.integrity_hash_vo import IntegrityHash
from medical_record.domain.value_objects.record_category_vo import RecordCategory


class MedicalRecordInteractor(MedicalRecordUseCase):
    def __init__(
        self,
        repository: MedicalRecordRepository,
        blockchain: BlockchainPort,
    ) -> None:
        self._repository = repository
        self._blockchain = blockchain

    async def create_record(self, command: CreateMedicalRecordCommand) -> MedicalRecordResponse:
        # 1) 도메인 규칙: 분류 검증 + 원본 바이트로부터 SHA-256 해시 추출
        integrity_hash = IntegrityHash.from_bytes(command.payload)
        record = MedicalRecord(
            record_id=str(uuid.uuid4()),
            user_id=command.user_id,
            institution_id=command.institution_id,
            category=RecordCategory(command.category),
            integrity_hash=integrity_hash,
            visit_date=command.visit_date,
            collected_at=datetime.now(timezone.utc),
        )
        response = await self._repository.save_record(record)

        # 2) 블록체인 앵커링: 스마트 계약 storeHash 호출 → 앵커 상태 저장
        anchor = BlockchainAnchor(
            anchor_id=str(uuid.uuid4()),
            record_id=record.record_id,
            hash_value=integrity_hash.value,
            chain_network=command.chain_network,
        )
        try:
            receipt = await self._blockchain.store_hash(record.record_id, integrity_hash.value)
            anchor.mark_anchored(
                tx_hash=receipt.tx_hash,
                block_number=receipt.block_number,
                anchored_at=datetime.now(timezone.utc),
            )
        except Exception:
            anchor.mark_failed()
        await self._repository.save_anchor(anchor)

        return response

    async def verify_record(self, query: VerifyMedicalRecordQuery) -> RecordVerificationResponse:
        record = await self._repository.find_record(query.record_id)
        if record is None:
            return RecordVerificationResponse(
                record_id=query.record_id,
                verified=False,
                stored_hash="",
                onchain_hash=None,
                reason="진료기록을 찾을 수 없습니다.",
            )

        onchain_hash = await self._blockchain.get_hash(record.record_id)
        verified = record.verify_against(onchain_hash)
        if onchain_hash is None:
            reason = "온체인 앵커가 없어 검증할 수 없습니다."
        elif verified:
            reason = "무결성 검증 성공 (온체인 해시 일치)."
        else:
            reason = "위변조 감지: 저장 해시와 온체인 해시가 불일치합니다."

        return RecordVerificationResponse(
            record_id=record.record_id,
            verified=verified,
            stored_hash=record.integrity_hash.value,
            onchain_hash=onchain_hash,
            reason=reason,
        )

    async def get_record(self, record_id: str) -> MedicalRecordResponse:
        record = await self._repository.find_record(record_id)
        if record is None:
            raise ValueError("진료기록을 찾을 수 없습니다.")
        return MedicalRecordResponse(
            record_id=record.record_id,
            user_id=record.user_id,
            institution_id=record.institution_id,
            category=str(record.category),
            integrity_hash=record.integrity_hash.value,
            visit_date=record.visit_date,
            collected_at=record.collected_at,
        )

    async def list_records(self, user_id: str) -> list[MedicalRecordResponse]:
        return await self._repository.list_records_by_user(user_id)
