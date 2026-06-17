"""medical_record 모듈 라우터 집계."""

from fastapi import APIRouter

from medical_record.adapter.inbound.api.v1.medical_record_router import (
    medical_record_router as _medical_record_v1,
)

medical_record_router = APIRouter()
medical_record_router.include_router(_medical_record_v1)

__all__ = ["medical_record_router"]
