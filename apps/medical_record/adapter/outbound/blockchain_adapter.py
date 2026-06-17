"""블록체인 아웃바운드 어댑터 — BlockchainPort 구현 (web3.py / Hardhat).

로컬 Hardhat 노드(기본 http://127.0.0.1:8545)의 스마트 계약과 통신하여
진료기록 해시를 ``storeHash`` 로 기록하고 ``getHash`` 로 조회한다.

web3 미설치 또는 노드 미연결 시에는 결정적 시뮬레이션으로 폴백하여
모듈 로드/개발이 막히지 않도록 한다 (graceful degradation).
"""

from __future__ import annotations

import hashlib
import logging
import os

from medical_record.app.ports.output.blockchain_port import AnchorReceipt, BlockchainPort

logger = logging.getLogger(__name__)

# 계약 ABI: storeHash(string recordId, string hashValue), getHash(string recordId) -> string
_CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "recordId", "type": "string"},
            {"internalType": "string", "name": "hashValue", "type": "string"},
        ],
        "name": "storeHash",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "string", "name": "recordId", "type": "string"}],
        "name": "getHash",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function",
    },
]


class BlockchainAdapter(BlockchainPort):
    """web3.py 기반 Hardhat 스마트 계약 어댑터."""

    # 노드 미연결 시 사용할 인메모리 시뮬레이션 저장소.
    # provider가 요청마다 새 인스턴스를 만들므로 클래스 레벨로 공유한다.
    _sim_store: dict[str, str] = {}

    def __init__(
        self,
        rpc_url: str | None = None,
        contract_address: str | None = None,
    ) -> None:
        self._rpc_url = rpc_url or os.getenv("HARDHAT_RPC_URL", "http://127.0.0.1:8545")
        self._contract_address = contract_address or os.getenv("ANCHOR_CONTRACT_ADDRESS", "")
        self._web3 = None
        self._contract = None

    def _ensure_contract(self) -> bool:
        """web3 연결과 계약 객체를 지연 초기화한다. 실패 시 False."""
        if self._contract is not None:
            return True
        if not self._contract_address:
            return False
        try:
            from web3 import Web3  # 지연 import: 미설치 환경에서 모듈 로드 보장

            web3 = Web3(Web3.HTTPProvider(self._rpc_url))
            if not web3.is_connected():
                logger.warning("Hardhat 노드에 연결할 수 없습니다: %s", self._rpc_url)
                return False
            self._web3 = web3
            self._contract = web3.eth.contract(
                address=Web3.to_checksum_address(self._contract_address),
                abi=_CONTRACT_ABI,
            )
            return True
        except Exception:
            logger.warning("web3/계약 초기화 실패 — 시뮬레이션으로 폴백", exc_info=True)
            return False

    async def store_hash(self, record_id: str, hash_value: str) -> AnchorReceipt:
        if self._ensure_contract():
            assert self._web3 is not None and self._contract is not None
            account = self._web3.eth.accounts[0]
            tx_hash = self._contract.functions.storeHash(record_id, hash_value).transact(
                {"from": account}
            )
            receipt = self._web3.eth.wait_for_transaction_receipt(tx_hash)
            return AnchorReceipt(
                tx_hash=receipt["transactionHash"].hex(),
                block_number=int(receipt["blockNumber"]),
            )

        # 폴백: 결정적 트랜잭션 해시 시뮬레이션
        self._sim_store[record_id] = hash_value
        sim_tx = "0x" + hashlib.sha256(f"{record_id}:{hash_value}".encode()).hexdigest()
        logger.info("블록체인 시뮬레이션 store_hash: record=%s", record_id)
        return AnchorReceipt(tx_hash=sim_tx, block_number=0)

    async def get_hash(self, record_id: str) -> str | None:
        if self._ensure_contract():
            assert self._contract is not None
            value = self._contract.functions.getHash(record_id).call()
            return value or None
        return self._sim_store.get(record_id)
