"""ORM ↔ Domain 변환기 (share_token)."""

from __future__ import annotations

from share_token.adapter.outbound.orm.share_consent_orm import ShareConsentORM
from share_token.domain.entities.share_token_entity import ShareToken


class ShareTokenMapper:
    @staticmethod
    def entity_to_orm(entity: ShareToken) -> ShareConsentORM:
        return ShareConsentORM(
            share_id=entity.share_id,
            user_id=entity.user_id,
            recipient_type=entity.recipient_type,
            recipient_did=entity.recipient_did,
            shared_items=list(entity.shared_items),
            disclosure_method=entity.disclosure_method,
            redis_token_key=entity.token_key,
            status=entity.status,
            issued_at=entity.issued_at,
            expires_at=entity.expires_at,
            used_at=entity.used_at,
        )

    @staticmethod
    def orm_to_entity(orm: ShareConsentORM) -> ShareToken:
        return ShareToken(
            share_id=orm.share_id,
            user_id=orm.user_id,
            recipient_type=orm.recipient_type,
            recipient_did=orm.recipient_did,
            shared_items=list(orm.shared_items or []),
            disclosure_method=orm.disclosure_method,
            token_key=orm.redis_token_key or "",
            status=orm.status,
            issued_at=orm.issued_at,
            expires_at=orm.expires_at,
            used_at=orm.used_at,
        )

    @staticmethod
    def apply_to_orm(entity: ShareToken, orm: ShareConsentORM) -> ShareConsentORM:
        """업데이트: 가변 상태(status/used_at)를 ORM에 반영한다."""
        orm.status = entity.status
        orm.used_at = entity.used_at
        return orm
