// 일회성 공유 토큰 발급/소비 (인메모리). 백엔드 share_token 의 Redis token_store 에 대응.
// redis_token_key 형식: vitalink:share_token:<token>

const PREFIX = 'vitalink:share_token:'

// 랜덤 토큰 문자열 생성
export function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function tokenKey(token) {
  return PREFIX + token
}

// share_consent 의 상태로 토큰 유효성 판정 (issued + 만료 전이면 소비 가능)
export function isTokenConsumable(consent) {
  if (!consent) return { ok: false, reason: '존재하지 않는 토큰' }
  if (consent.status === 'used') return { ok: false, reason: '이미 사용된 토큰입니다' }
  if (consent.status === 'revoked') return { ok: false, reason: '폐기된 토큰입니다' }
  if (consent.expires_at && new Date(consent.expires_at) < new Date())
    return { ok: false, reason: '만료된 토큰입니다' }
  return { ok: true, reason: '유효한 토큰' }
}
