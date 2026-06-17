"""
SQLAlchemy Base 클래스 및 공통 믹스인.

루즈한 결합도로 설계 - 각 도메인(Bounded Context)이 독립적으로 사용 가능.
ORM 모델은 오직 adapter/outbound/orm 레이어에서만 이 Base를 상속한다.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    모든 ORM 모델의 기본 클래스.

    - 도메인 간 직접 의존 없음
    - 공통 기능은 믹스인으로 제공
    - 각 도메인은 독립적으로 진화 가능
    """

    pass


def _new_uuid() -> str:
    """CHAR(36) UUID 문자열을 생성한다 (ERD PK 규격)."""
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    """타임존이 포함된 현재 UTC 시각을 반환한다."""
    return datetime.now(timezone.utc)


class CreatedAtMixin:
    """생성 시각(created_at) 공통 컬럼 믹스인."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=_utcnow,
        nullable=False,
    )


def uuid_pk(column_name: str) -> Mapped[str]:
    """ERD의 명명된 CHAR(36) PK 컬럼을 선언하는 헬퍼.

    ERD가 ``user_id``, ``record_id`` 처럼 테이블마다 다른 PK 컬럼명을 쓰므로
    공통 ``id`` 믹스인 대신 컬럼명을 명시하는 팩토리를 제공한다.
    """
    return mapped_column(column_name, String(36), primary_key=True, default=_new_uuid)
