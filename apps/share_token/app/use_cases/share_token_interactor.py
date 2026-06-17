"""share_token Interactor — ShareTokenUseCase 구현체.

DB는 ShareTokenRepository, Redis는 TokenStorePort 추상에만 의존한다 (DIP).
redis_adapter 구현체를 직접 import 하지 않는다.
"""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone

from share_token.app.dtos.share_token_dto import (
    IssueShareTokenCommand,
    RedeemResultResponse,
    RedeemShareTokenCommand,
    ShareTokenResponse,
)
from share_token.app.ports.input.share_token_use_case import ShareTokenUseCase
from share_token.app.ports.output.share_token_repository import ShareTokenRepository
from share_token.app.ports.output.token_store_port import TokenStorePort
from share_token.domain.entities.share_token_entity import STATUS_ISSUED, ShareToken
from share_token.domain.value_objects.token_ttl_vo import TokenTtl


class ShareTokenInteractor(ShareTokenUseCase):
    def __init__(
        self,
        repository: ShareTokenRepository,
        token_store: TokenStorePort,
    ) -> None:
        self._repository = repository
        self._token_store = token_store

    async def issue_token(self, command: IssueShareTokenCommand) -> ShareTokenResponse:
        # 도메인 규칙: TTL 검증
        ttl = TokenTtl(command.ttl_seconds)
        now = datetime.now(timezone.utc)
        raw_token = secrets.token_urlsafe(32)

        token = ShareToken(
            share_id=str(uuid.uuid4()),
            user_id=command.user_id,
            recipient_type=command.recipient_type,
            recipient_did=command.recipient_did,
            shared_items=list(command.shared_items),
            disclosure_method=command.disclosure_method,
            token_key=raw_token,
            status=STATUS_ISSUED,
            issued_at=now,
            expires_at=now + timedelta(seconds=ttl.seconds),
        )
        saved = await self._repository.save(token)
        # Redis에 TTL과 함께 저장 → 만료 시 자동 파기
        await self._token_store.save(raw_token, saved.share_id, ttl.seconds)

        return ShareTokenResponse(
            share_id=saved.share_id,
            user_id=saved.user_id,
            recipient_type=saved.recipient_type,
            token=raw_token,
            status=saved.status,
            issued_at=saved.issued_at,
            expires_at=saved.expires_at,
        )

    async def redeem_token(self, command: RedeemShareTokenCommand) -> RedeemResultResponse:
        # Redis에서 1회성 소비 (GETDEL 의미). 없으면 만료/사용됨.
        share_id = await self._token_store.consume(command.token)
        if share_id is None:
            return RedeemResultResponse(
                share_id=None, redeemed=False, reason="토큰이 만료되었거나 이미 사용되었습니다."
            )

        token = await self._repository.find_by_id(share_id)
        if token is None:
            return RedeemResultResponse(
                share_id=share_id, redeemed=False, reason="공유 동의 기록을 찾을 수 없습니다."
            )

        now = datetime.now(timezone.utc)
        if not token.is_redeemable(now):
            return RedeemResultResponse(
                share_id=share_id, redeemed=False, reason="사용할 수 없는 토큰 상태입니다."
            )

        token.mark_used(now)
        await self._repository.update(token)
        return RedeemResultResponse(
            share_id=share_id,
            redeemed=True,
            shared_items=list(token.shared_items),
            reason="공유 토큰 사용 완료 (일회성 파기됨).",
        )

    async def revoke_token(self, share_id: str) -> ShareTokenResponse:
        token = await self._repository.find_by_id(share_id)
        if token is None:
            raise ValueError("폐기할 공유 토큰을 찾을 수 없습니다.")
        token.revoke()
        await self._repository.update(token)
        await self._token_store.delete(token.token_key)
        return ShareTokenResponse(
            share_id=token.share_id,
            user_id=token.user_id,
            recipient_type=token.recipient_type,
            token=token.token_key,
            status=token.status,
            issued_at=token.issued_at,
            expires_at=token.expires_at,
        )
