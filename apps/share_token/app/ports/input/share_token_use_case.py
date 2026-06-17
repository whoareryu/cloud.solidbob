"""share_token 인바운드 포트 — UseCase ABC."""

from __future__ import annotations

from abc import ABC, abstractmethod

from share_token.app.dtos.share_token_dto import (
    IssueShareTokenCommand,
    RedeemResultResponse,
    RedeemShareTokenCommand,
    ShareTokenResponse,
)


class ShareTokenUseCase(ABC):
    """Redis 기반 일회성 공유 토큰 유스케이스 계약."""

    @abstractmethod
    async def issue_token(self, command: IssueShareTokenCommand) -> ShareTokenResponse: ...

    @abstractmethod
    async def redeem_token(self, command: RedeemShareTokenCommand) -> RedeemResultResponse: ...

    @abstractmethod
    async def revoke_token(self, share_id: str) -> ShareTokenResponse: ...
