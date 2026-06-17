"""identity 인바운드 포트 — UseCase ABC (인터페이스 선언만)."""

from __future__ import annotations

from abc import ABC, abstractmethod

from identity.app.dtos.identity_dto import (
    CredentialResponse,
    IssueCredentialCommand,
    VerificationResponse,
    VerifyCredentialQuery,
)


class IdentityUseCase(ABC):
    """DID/VC 가족 건강 위임 유스케이스 계약."""

    @abstractmethod
    async def issue_credential(self, command: IssueCredentialCommand) -> CredentialResponse: ...

    @abstractmethod
    async def verify_credential(self, query: VerifyCredentialQuery) -> VerificationResponse: ...

    @abstractmethod
    async def list_credentials(self, holder_user_id: str) -> list[CredentialResponse]: ...

    @abstractmethod
    async def revoke_credential(self, vc_id: str) -> CredentialResponse: ...
