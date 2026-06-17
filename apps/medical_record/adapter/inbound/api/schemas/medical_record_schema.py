"""medical_record HTTP 경계 Pydantic 스키마."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, Field


class CreateMedicalRecordSchema(BaseModel):
    """의료 데이터 생성 요청. ``content_base64`` 의 SHA-256을 해시·앵커링한다."""

    user_id: str = Field(..., description="회원 ID")
    institution_id: str | None = Field(None, description="의료기관 ID")
    category: str = Field(..., description="diagnosis|prescription|lab_test|checkup|imaging")
    content_base64: str = Field(..., description="해시 대상 원본 데이터(Base64)")
    chain_network: str = Field("hardhat_local", description="앵커링할 체인 네트워크")
    fhir_resource_type: str | None = Field(None, description="FHIR 리소스 타입")
    mongo_resource_id: str | None = Field(None, description="Mongo 원본 참조")
    visit_date: date | None = Field(None, description="방문일")


class MedicalRecordResponseSchema(BaseModel):
    record_id: str
    user_id: str
    institution_id: str | None
    category: str
    integrity_hash: str
    visit_date: date | None
    collected_at: datetime


class RecordVerificationResponseSchema(BaseModel):
    record_id: str
    verified: bool
    stored_hash: str
    onchain_hash: str | None
    reason: str
