"""share_token FastAPI 라우터 — HTTP 수신 → UseCase 위임 → 응답."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from share_token.adapter.inbound.api.schemas.share_token_schema import (
    IssueShareTokenSchema,
    RedeemResultResponseSchema,
    RedeemShareTokenSchema,
    ShareTokenResponseSchema,
)
from share_token.app.dtos.share_token_dto import (
    IssueShareTokenCommand,
    RedeemShareTokenCommand,
)
from share_token.app.ports.input.share_token_use_case import ShareTokenUseCase
from share_token.dependencies.share_token_provider import get_share_token_use_case

share_token_router = APIRouter(prefix="/api/v1/share-tokens", tags=["share_token"])


@share_token_router.post("", response_model=ShareTokenResponseSchema)
async def issue_token(
    schema: IssueShareTokenSchema,
    use_case: ShareTokenUseCase = Depends(get_share_token_use_case),
) -> ShareTokenResponseSchema:
    try:
        command = IssueShareTokenCommand(
            user_id=schema.user_id,
            recipient_type=schema.recipient_type,
            shared_items=schema.shared_items,
            ttl_seconds=schema.ttl_seconds,
            recipient_did=schema.recipient_did,
            disclosure_method=schema.disclosure_method,
        )
        result = await use_case.issue_token(command)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return ShareTokenResponseSchema(**result.__dict__)


@share_token_router.post("/redeem", response_model=RedeemResultResponseSchema)
async def redeem_token(
    schema: RedeemShareTokenSchema,
    use_case: ShareTokenUseCase = Depends(get_share_token_use_case),
) -> RedeemResultResponseSchema:
    result = await use_case.redeem_token(RedeemShareTokenCommand(token=schema.token))
    return RedeemResultResponseSchema(**result.__dict__)


@share_token_router.post("/{share_id}/revoke", response_model=ShareTokenResponseSchema)
async def revoke_token(
    share_id: str,
    use_case: ShareTokenUseCase = Depends(get_share_token_use_case),
) -> ShareTokenResponseSchema:
    try:
        result = await use_case.revoke_token(share_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return ShareTokenResponseSchema(**result.__dict__)
