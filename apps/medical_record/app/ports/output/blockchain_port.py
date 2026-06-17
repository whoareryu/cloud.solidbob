"""블록체인 아웃바운드 포트(SPI) — BlockchainPort ABC.

Interactor는 이 추상에만 의존한다. web3/Hardhat 같은 인프라 타입을 노출하지 않는다.
``store_hash`` / ``get_hash`` 는 스마트 계약의 ``storeHash`` / ``getHash`` 에 대응한다.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class AnchorReceipt:
    """온체인 기록 영수증 (트랜잭션 결과)."""

    tx_hash: str
    block_number: int


class BlockchainPort(ABC):
    @abstractmethod
    async def store_hash(self, record_id: str, hash_value: str) -> AnchorReceipt:
        """진료기록 해시를 스마트 계약에 기록(storeHash)하고 영수증을 반환한다."""
        ...

    @abstractmethod
    async def get_hash(self, record_id: str) -> str | None:
        """스마트 계약에서 기록된 해시를 조회(getHash)한다. 없으면 None."""
        ...
