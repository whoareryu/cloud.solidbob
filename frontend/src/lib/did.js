// DID/VC 목 발급·검증. 백엔드 identity 도메인(did_vo, verifiable_credential)에 대응.
// 실제 SSI 인증을 흉내내는 데모 스텁 — 추후 OpenID4VC / SD-JWT 라이브러리로 교체.

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

// 모바일 신분증(DID) 인증 흐름 시뮬레이션. 약 2초 로딩 후 DID 반환.
export async function authenticateWithMobileId() {
  await delay(2000)
  return {
    did: 'did:web:vitalink.io:user:minjun',
    did_method: 'did:web',
    verified: true,
  }
}

// ---------- 휴대폰 본인인증 (PASS 스타일 목업) ----------
// 실제로는 통신사/본인확인기관(NICE 등) → SMS 발송 서버가 처리. 데모는 인메모리로 시뮬레이션하고
// 발송된 인증번호를 그대로 반환해 발표 중 입력 시연이 가능하게 한다. (교체 지점)
let _pendingVerification = null

export async function sendVerificationCode(payload) {
  await delay(1000) // SMS 발송 연출
  const code = String(Math.floor(100000 + Math.random() * 900000)) // 6자리
  _pendingVerification = {
    code,
    payload,
    expiresAt: Date.now() + 180_000, // 3분
  }
  // 데모: 실제 서비스에서는 코드가 SMS 로만 전달된다.
  return { sent: true, code, expiresAt: _pendingVerification.expiresAt }
}

export async function confirmVerificationCode(input) {
  await delay(800)
  if (!_pendingVerification) return { ok: false, reason: '인증 요청이 없습니다. 다시 시도해 주세요.' }
  if (Date.now() > _pendingVerification.expiresAt)
    return { ok: false, reason: '인증 시간이 만료되었습니다. 인증번호를 재발송해 주세요.' }
  if (String(input).trim() !== _pendingVerification.code)
    return { ok: false, reason: '인증번호가 일치하지 않습니다.' }

  const profile = { ..._pendingVerification.payload }
  _pendingVerification = null
  return {
    ok: true,
    did: 'did:web:vitalink.io:user:jiwon',
    did_method: 'did:web',
    profile,
  }
}

// VC 유효성 검증 목 (status === 'valid' 이고 만료 전이면 통과).
export function verifyCredential(vc) {
  const notExpired = !vc.expires_at || new Date(vc.expires_at) > new Date()
  const valid = vc.status === 'valid' && notExpired
  return {
    vc_id: vc.vc_id,
    valid,
    status: vc.status,
    reason: valid ? '서명·상태·유효기간 검증 통과' : '만료되었거나 폐기된 자격증명',
  }
}
