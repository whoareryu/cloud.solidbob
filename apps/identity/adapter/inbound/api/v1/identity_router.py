"""identity FastAPI 라우터 — HTTP 수신 → UseCase 위임 → 응답."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from identity.adapter.inbound.api.schemas.identity_schema import (
    CredentialResponseSchema,
    IssueCredentialSchema,
    VerificationResponseSchema,
)
from identity.app.dtos.identity_dto import IssueCredentialCommand, VerifyCredentialQuery
from identity.app.ports.input.identity_use_case import IdentityUseCase
from identity.dependencies.identity_provider import get_identity_use_case

identity_router = APIRouter(prefix="/api/v1/identity", tags=["identity"])


@identity_router.post("/credentials", response_model=CredentialResponseSchema)
async def issue_credential(
    schema: IssueCredentialSchema,
    use_case: IdentityUseCase = Depends(get_identity_use_case),
) -> CredentialResponseSchema:
    try:
        command = IssueCredentialCommand(
            holder_user_id=schema.holder_user_id,
            delegate_did=schema.delegate_did,
            type_code=schema.type_code,
            issuer_id=schema.issuer_id,
            format=schema.format,
            expires_at=schema.expires_at,
            claims=schema.claims,
        )
        result = await use_case.issue_credential(command)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return CredentialResponseSchema(**result.__dict__)


@identity_router.get("/credentials", response_model=list[CredentialResponseSchema])
async def list_credentials(
    holder_user_id: str,
    use_case: IdentityUseCase = Depends(get_identity_use_case),
) -> list[CredentialResponseSchema]:
    results = await use_case.list_credentials(holder_user_id)
    return [CredentialResponseSchema(**r.__dict__) for r in results]


@identity_router.get("/credentials/{vc_id}/verify", response_model=VerificationResponseSchema)
async def verify_credential(
    vc_id: str,
    use_case: IdentityUseCase = Depends(get_identity_use_case),
) -> VerificationResponseSchema:
    result = await use_case.verify_credential(VerifyCredentialQuery(vc_id=vc_id))
    return VerificationResponseSchema(**result.__dict__)


@identity_router.post("/credentials/{vc_id}/revoke", response_model=CredentialResponseSchema)
async def revoke_credential(
    vc_id: str,
    use_case: IdentityUseCase = Depends(get_identity_use_case),
) -> CredentialResponseSchema:
    try:
        result = await use_case.revoke_credential(vc_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return CredentialResponseSchema(**result.__dict__)
