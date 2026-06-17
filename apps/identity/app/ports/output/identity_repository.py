"""identity 아웃바운드 포트 — Repository ABC (DB SPI).

ORM/SQLAlchemy 타입을 노출하지 않고 DTO/도메인 객체로만 소통한다.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from identity.app.dtos.identity_dto import CredentialResponse
from identity.domain.entities.verifiable_credential_entity import VerifiableCredential


class IdentityRepository(ABC):
    @abstractmethod
    async def save(self, credential: VerifiableCredential) -> CredentialResponse: ...

    @abstractmethod
    async def find_by_id(self, vc_id: str) -> VerifiableCredential | None: ...

    @abstractmethod
    async def list_by_holder(self, holder_user_id: str) -> list[CredentialResponse]: ...

    @abstractmethod
    async def update_status(self, vc_id: str, status: str) -> CredentialResponse | None: ...

    @abstractmethod
    async def is_trusted_issuer(self, issuer_id: str, type_code: str) -> bool: ...
