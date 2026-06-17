// Mock API — 인위적 지연이 있는 프로미스 기반 함수.
// **백엔드 교체 지점**: 이 파일의 각 함수를 fetch('/api/v1/...') 로 바꾸면
// FastAPI(main.py) 의 실제 엔드포인트로 연결된다. 엔드포인트 매핑은 README 참조.

import { buildSeed, CURRENT_USER_ID } from './seed'
import { anchorHash } from '../lib/chain'
import { generateToken, tokenKey, isTokenConsumable } from '../lib/token'
import { findInteractions } from '../lib/interactions'
import { authenticateWithMobileId } from '../lib/did'

// 인메모리 DB (역할 스위처가 공유하는 단일 상태원)
let db = buildSeed()

const delay = (min = 300, max = 800) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)))

const clone = (v) => JSON.parse(JSON.stringify(v))
const uuid = () =>
  crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(16).slice(2)

// ---------- 리셋 (발표 재시연용) ----------
export async function resetDb() {
  await delay(150, 300)
  db = buildSeed()
  return true
}

// ---------- auth / identity ----------
export async function login({ skipMobileAuth = false } = {}) {
  // 휴대폰 본인인증을 이미 통과했다면(skipMobileAuth) 추가 DID 인증 연출을 생략한다.
  let did = 'did:web:vitalink.io:user:jiwon'
  if (!skipMobileAuth) {
    const auth = await authenticateWithMobileId() // 약 2초 DID 인증
    did = auth.did
  } else {
    await delay(200, 400)
  }
  const user = db.users.find((u) => u.user_id === CURRENT_USER_ID)
  return { user: clone(user), did, role: 'patient' }
}

// 본인인증 입력값(이름+생년월일)을 등록 회원과 대조. 불일치 시 matched=false.
export async function verifyIdentity({ name, birth }) {
  await delay(300, 600)
  const user = db.users.find((u) => u.name === name && u.birth_date === birth)
  return { matched: !!user, user: user ? clone(user) : null }
}

export async function getCredentials() {
  await delay()
  return clone(db.verifiable_credentials)
}

// ---------- medical_records ----------
export async function listRecords() {
  await delay()
  // 연동된 기록만 타임라인에 노출
  return clone(db.medical_records.filter((r) => r._connected))
}

export async function getRecord(recordId) {
  await delay()
  const r = db.medical_records.find((x) => x.record_id === recordId)
  return r ? clone(r) : null
}

export async function getAnchor(recordId) {
  await delay(200, 500)
  const a = db.blockchain_anchors.find((x) => x.record_id === recordId)
  return a ? clone(a) : null
}

export async function getChainConfig(chainNetwork) {
  const c = db.chain_configs.find((x) => x.chain_network === chainNetwork)
  return c ? clone(c) : null
}

// 전체 의료기관 목록 (이름 매핑용)
export async function listInstitutions() {
  await delay(100, 250)
  return clone(db.medical_institutions)
}

// 미연동 기관 목록 (연동 가능한 기관)
export async function listUnconnectedInstitutions() {
  await delay()
  const pendingInstIds = new Set(
    db.medical_records.filter((r) => !r._connected).map((r) => r.institution_id),
  )
  return clone(db.medical_institutions.filter((i) => pendingInstIds.has(i.institution_id)))
}

// 기관 연동 → FHIR 기록 수집 → 자동 앵커링
export async function connectInstitution(institutionId) {
  await delay(800, 1400) // FHIR 수집 시뮬레이션
  const collected = []
  for (const rec of db.medical_records) {
    if (rec.institution_id === institutionId && !rec._connected) {
      rec._connected = true
      rec.collected_at = new Date().toISOString()
      // 자동 앵커링
      const anchor = anchorHash(rec.integrity_hash, 'ethereum_sepolia')
      db.blockchain_anchors.push({ anchor_id: uuid(), record_id: rec.record_id, ...anchor })
      collected.push(clone(rec))
    }
  }
  return collected
}

// ---------- share_token ----------
// 공유 참조 ID(사람이 읽는 코드) + 6자리 인증번호 생성
function genShareRef() {
  const hex = generateToken().slice(0, 4).toUpperCase()
  return `VL-${hex}`
}
function genShareCode() {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6자리
}

// 일회성 공유 토큰 발급 (share_consent + redis token 생성)
// QR(token) 과 더불어 PC 입력용 share_ref + share_code 를 함께 발급한다.
export async function issueShareToken({ recipient_type, shared_items, disclosure_method, ttl_seconds }) {
  await delay()
  const token = generateToken()
  const issuedAt = new Date()
  const consent = {
    share_id: uuid(),
    user_id: CURRENT_USER_ID,
    recipient_type,
    recipient_did: null,
    shared_items,
    disclosure_method: disclosure_method ?? 'sd_jwt',
    redis_token_key: tokenKey(token),
    token, // QR 에 담을 토큰
    share_ref: genShareRef(), // PC 입력용 공유 ID
    share_code: genShareCode(), // PC 입력용 6자리 인증번호
    status: 'issued',
    issued_at: issuedAt.toISOString(),
    expires_at: new Date(issuedAt.getTime() + (ttl_seconds ?? 300) * 1000).toISOString(),
    used_at: null,
  }
  db.share_consents.unshift(consent)
  return clone(consent)
}

export async function getConsent(shareId) {
  await delay(150, 400)
  const c = db.share_consents.find((x) => x.share_id === shareId)
  return c ? clone(c) : null
}

export async function listConsents() {
  await delay()
  // 만료 자동 반영
  const nowTs = Date.now()
  for (const c of db.share_consents) {
    if (c.status === 'issued' && c.expires_at && new Date(c.expires_at).getTime() < nowTs) {
      c.status = 'expired'
    }
  }
  return clone(db.share_consents)
}

// consent 소비 공통 로직 (만료 선반영 → 검증 → 소멸 → 로그)
async function consumeConsent(consent, denyReason = null) {
  // 만료 선반영
  if (consent && consent.status === 'issued' && consent.expires_at &&
      new Date(consent.expires_at).getTime() < Date.now()) {
    consent.status = 'expired'
  }
  const check = denyReason ? { ok: false, reason: denyReason } : isTokenConsumable(consent)
  if (!check.ok) {
    await addLog({
      accessor_type: 'doctor',
      access_type: 'share',
      record_id: null,
      items: consent?.shared_items ?? [],
      result: 'denied',
      accessor_did: 'did:web:clinic.demo:doctor',
    })
    return { share_id: consent?.share_id ?? null, redeemed: false, shared_items: [], reason: check.reason }
  }
  consent.status = 'used'
  consent.used_at = new Date().toISOString()
  const items = resolveSharedItems(consent.shared_items)
  await addLog({
    accessor_type: 'doctor',
    access_type: 'share',
    record_id: null,
    items: consent.shared_items,
    result: 'success',
    accessor_did: 'did:web:clinic.demo:doctor',
  })
  return { share_id: consent.share_id, redeemed: true, shared_items: items, reason: '열람 성공 — 토큰 소멸' }
}

// 토큰 소비 (clinic 단말 QR 스캔). 1회만 성공, 이후 'used'.
export async function redeemShareToken(token) {
  await delay(400, 900)
  const consent = db.share_consents.find((c) => c.token === token)
  return consumeConsent(consent)
}

// 공유 ID + 인증번호로 소비 (PC 단말용). 백엔드에선 (ref, code) → token 매핑 후 redeem.
export async function redeemShareByCode(shareRef, code) {
  await delay(400, 900)
  const ref = (shareRef ?? '').trim().toUpperCase()
  const consent = db.share_consents.find((c) => c.share_ref === ref)
  if (!consent) {
    return { share_id: null, redeemed: false, shared_items: [], reason: '존재하지 않는 공유 ID 입니다' }
  }
  if (String(consent.share_code) !== String(code ?? '').trim()) {
    await addLog({
      accessor_type: 'doctor', access_type: 'share', record_id: null,
      items: consent.shared_items, result: 'denied', accessor_did: 'did:web:clinic.demo:doctor',
    })
    return { share_id: consent.share_id, redeemed: false, shared_items: [], reason: '인증번호가 일치하지 않습니다' }
  }
  return consumeConsent(consent)
}

export async function revokeConsent(shareId) {
  await delay(200, 500)
  const c = db.share_consents.find((x) => x.share_id === shareId)
  if (c && c.status === 'issued') {
    c.status = 'revoked'
  }
  return c ? clone(c) : null
}

// shared_items(record_id 또는 항목키)를 표시용 객체로 해석
function resolveSharedItems(sharedItems) {
  return sharedItems.map((item) => {
    const rec = db.medical_records.find((r) => r.record_id === item)
    if (rec) {
      const inst = db.medical_institutions.find((i) => i.institution_id === rec.institution_id)
      return { type: 'record', record_id: rec.record_id, title: rec.title, category: rec.category,
        institution_name: inst?.name, visit_date: rec.visit_date, summary: rec.summary }
    }
    // 응급 항목 키(allergies 등)
    const info = db.emergency_medical_info.find((e) => e.user_id === CURRENT_USER_ID)
    return { type: 'field', key: item, value: info ? info[item] : null }
  })
}

// ---------- emergency ----------
export async function getEmergencyInfo() {
  await delay(200, 500)
  const info = db.emergency_medical_info.find((e) => e.user_id === CURRENT_USER_ID)
  return info ? clone(info) : null
}

export async function updateEmergencyInfo(patch) {
  await delay()
  const info = db.emergency_medical_info.find((e) => e.user_id === CURRENT_USER_ID)
  Object.assign(info, patch)
  return clone(info)
}

export async function getUser() {
  await delay(100, 300)
  return clone(db.users.find((u) => u.user_id === CURRENT_USER_ID))
}

// 현재 복용약 파생 (prescribed_date + duration_days 가 오늘 이후면 복용 중)
export async function currentMedications() {
  await delay(150, 400)
  const today = Date.now()
  const meds = db.prescriptions
    .filter((p) => p.user_id === CURRENT_USER_ID)
    .filter((p) => {
      const end = new Date(p.prescribed_date).getTime() + p.duration_days * 86400000
      return end >= today
    })
    .map((p) => {
      const drug = db.drugs.find((d) => d.drug_code === p.drug_code)
      return { ...p, drug_name: drug?.drug_name ?? p.drug_code }
    })
  return clone(meds)
}

// 응급 접근 권한 부여 (만료시간 있는 임시 권한)
export async function requestEmergencyAccess() {
  await delay(600, 1100)
  const now = new Date()
  const grant = {
    emergency_id: uuid(),
    user_id: CURRENT_USER_ID,
    hospital_id: 'c3333333-0000-0000-0000-000000000002',
    granted_items: ['blood_type', 'allergies', 'chronic_conditions', 'medications'],
    reason: '응급실 내원 — 응급 접근',
    status: 'active',
    granted_at: now.toISOString(),
    expires_at: new Date(now.getTime() + 3600 * 1000).toISOString(),
  }
  db.emergency_access.unshift(grant)
  await addLog({
    accessor_type: 'emergency',
    access_type: 'emergency',
    record_id: null,
    items: grant.granted_items,
    result: 'success',
    accessor_did: 'did:web:er.gangnam.severance.org',
  })
  return clone(grant)
}

export async function getDrugs() {
  await delay(100, 300)
  return clone(db.drugs)
}

export async function getDrugInteractions() {
  return clone(db.drug_interactions)
}

// 신규 처방 약물충돌 검사
export async function checkInteraction(newDrugCode) {
  await delay(300, 600)
  const meds = await currentMedications()
  const currentCodes = meds.map((m) => m.drug_code)
  const drugsById = Object.fromEntries(db.drugs.map((d) => [d.drug_code, d]))
  const hits = findInteractions(newDrugCode, currentCodes, db.drug_interactions, drugsById)
  return hits
}

// ---------- access_logs ----------
export async function addLog({ accessor_type, access_type, record_id, items, result = 'success', accessor_did = null }) {
  const log = {
    log_id: uuid(),
    user_id: CURRENT_USER_ID,
    accessor_did,
    accessor_type,
    record_id,
    access_type,
    items: items ?? null,
    result,
    ip_address: '203.0.113.' + (10 + Math.floor(Math.random() * 200)),
    accessed_at: new Date().toISOString(),
  }
  db.access_logs.unshift(log)
  return clone(log)
}

export async function listLogs() {
  await delay(150, 400)
  return clone(db.access_logs)
}
