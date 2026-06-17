// SHA-256 해시 생성 (데모용). 브라우저 SubtleCrypto 사용.
// 백엔드 medical_record 도메인의 integrity_hash 와 동일한 알고리즘(SHA-256 hex).

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 동기 환경(시드)용 결정적 해시 — SubtleCrypto 는 async 라서 데모 시드에는 간이 해시를 쓴다.
// 실제 무결성 비교는 sha256Hex 로 수행한다.
export function pseudoHash(text) {
  let h1 = 0xdeadbeef ^ text.length
  let h2 = 0x41c6ce57 ^ text.length
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  const part = (n) => (n >>> 0).toString(16).padStart(8, '0')
  // 64자리 hex 형태로 확장 (SHA-256 모양 흉내)
  return (part(h1) + part(h2) + part(h1 ^ h2) + part(h2 ^ 0x9e3779b9)
    + part(h1 + h2) + part(h1 * 3) + part(h2 * 7) + part(h1 ^ (h2 << 1))).slice(0, 64)
}
