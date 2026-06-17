"""medical_record FastAPI 라우터 — HTTP 수신 → UseCase 위임 → 응답."""

from __future__ import annotations

import base64
import binascii

from fastapi import APIRouter, Depends, HTTPException

from medical_record.adapter.inbound.api.schemas.medical_record_schema import (
    CreateMedicalRecordSchema,
    MedicalRecordResponseSchema,
    RecordVerificationResponseSchema,
)
from medical_record.app.dtos.medical_record_dto import (
    CreateMedicalRecordCommand,
    VerifyMedicalRecordQuery,
)
from medical_record.app.ports.input.medical_record_use_case import MedicalRecordUseCase
from medical_record.dependencies.medical_record_provider import get_medical_record_use_case

medical_record_router = APIRouter(prefix="/api/v1/medical-records", tags=["medical_record"])


@medical_record_router.post("", response_model=MedicalRecordResponseSchema)
async def create_record(
    schema: CreateMedicalRecordSchema,
    use_case: MedicalRecordUseCase = Depends(get_medical_record_use_case),
) -> MedicalRecordResponseSchema:
    try:
        payload = base64.b64decode(schema.content_base64, validate=True)
    except (binascii.Error, ValueError) as e:
        raise HTTPException(status_code=400, detail="content_base64 디코딩 실패") from e

    try:
        command = CreateMedicalRecordCommand(
            user_id=schema.user_id,
            institution_id=schema.institution_id,
            category=schema.category,
            payload=payload,
            chain_network=schema.chain_network,
            fhir_resource_type=schema.fhir_resource_type,
            mongo_resource_id=schema.mongo_resource_id,
            visit_date=schema.visit_date,
        )
        result = await use_case.create_record(command)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return MedicalRecordResponseSchema(**result.__dict__)


@medical_record_router.get("", response_model=list[MedicalRecordResponseSchema])
async def list_records(
    user_id: str,
    use_case: MedicalRecordUseCase = Depends(get_medical_record_use_case),
) -> list[MedicalRecordResponseSchema]:
    results = await use_case.list_records(user_id)
    return [MedicalRecordResponseSchema(**r.__dict__) for r in results]


@medical_record_router.get("/{record_id}", response_model=MedicalRecordResponseSchema)
async def get_record(
    record_id: str,
    use_case: MedicalRecordUseCase = Depends(get_medical_record_use_case),
) -> MedicalRecordResponseSchema:
    try:
        result = await use_case.get_record(record_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return MedicalRecordResponseSchema(**result.__dict__)


@medical_record_router.get(
    "/{record_id}/verify", response_model=RecordVerificationResponseSchema
)
async def verify_record(
    record_id: str,
    use_case: MedicalRecordUseCase = Depends(get_medical_record_use_case),
) -> RecordVerificationResponseSchema:
    result = await use_case.verify_record(VerifyMedicalRecordQuery(record_id=record_id))
    return RecordVerificationResponseSchema(**result.__dict__)
