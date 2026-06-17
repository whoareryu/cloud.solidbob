"""share_token 모듈 라우터 집계."""

from fastapi import APIRouter

from share_token.adapter.inbound.api.v1.share_token_router import (
    share_token_router as _share_token_v1,
)

share_token_router = APIRouter()
share_token_router.include_router(_share_token_v1)

__all__ = ["share_token_router"]
