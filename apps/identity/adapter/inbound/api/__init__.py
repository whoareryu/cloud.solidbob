"""identity 모듈 라우터 집계."""

from fastapi import APIRouter

from identity.adapter.inbound.api.v1.identity_router import identity_router as _identity_v1

identity_router = APIRouter()
identity_router.include_router(_identity_v1)

__all__ = ["identity_router"]
