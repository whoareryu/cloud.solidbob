// 블록체인 앵커링 목. 백엔드 medical_record 의 blockchain_anchor / chain_config 에 대응.
// txHash 생성 + explorer URL 조합. 실제 체인 호출 없음 (Hardhat/Sepolia 시뮬레이션).

import { pseudoHash } from './hash'

// 기록 해시를 체인에 "앵커링" — tx_hash, block_number 를 만들어 반환.
export function anchorHash(hashValue, chainNetwork = 'ethereum_sepolia') {
  const txHash = '0x' + pseudoHash(`tx:${hashValue}:${Date.now()}`)
  const blockNumber = 4_800_000 + Math.floor(Math.random() * 200000)
  return {
    hash_value: hashValue,
    chain_network: chainNetwork,
    tx_hash: txHash,
    block_number: blockNumber,
    status: 'anchored',
    anchored_at: new Date().toISOString(),
  }
}

// chain_config.explorer_base_url + tx_hash → 익스플로러 링크
export function explorerUrl(explorerBaseUrl, txHash) {
  if (!explorerBaseUrl || !txHash) return null
  return `${explorerBaseUrl.replace(/\/$/, '')}/tx/${txHash}`
}
