// 포맷 유틸 (날짜/카테고리/상대시간 등)

const CATEGORY_LABELS = {
  diagnosis: '진단',
  prescription: '처방',
  lab_test: '검사',
  checkup: '건강검진',
  imaging: '영상',
}

const RECIPIENT_LABELS = {
  doctor: '의사',
  hospital: '병원',
  insurer: '보험사',
  pharmacy: '약국',
  government: '공공기관',
}

const ACCESSOR_LABELS = {
  doctor: '의사',
  hospital: '병원',
  insurer: '보험사',
  pharmacy: '약국',
  emergency: '응급실',
  patient: '본인',
}

const ACCESS_TYPE_LABELS = {
  read: '열람',
  verify: '검증',
  share: '공유 열람',
  emergency: '응급 열람',
}

const ITEM_LABELS = {
  blood_type: '혈액형',
  allergies: '알러지',
  chronic_conditions: '만성질환',
  medications: '복용약',
  emergency_contact: '비상연락처',
}

export const categoryLabel = (c) => CATEGORY_LABELS[c] ?? c
export const recipientLabel = (r) => RECIPIENT_LABELS[r] ?? r
export const accessorLabel = (a) => ACCESSOR_LABELS[a] ?? a
export const accessTypeLabel = (a) => ACCESS_TYPE_LABELS[a] ?? a
export const itemLabel = (i) => ITEM_LABELS[i] ?? i

export function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

export function formatDateTime(value) {
  if (!value) return '-'
  const d = new Date(value)
  return `${formatDate(value)} ${String(d.getHours()).padStart(2, '0')}:${String(
    d.getMinutes(),
  ).padStart(2, '0')}`
}

export function relativeTime(value) {
  if (!value) return '-'
  const diff = Date.now() - new Date(value).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  return `${day}일 전`
}

export function shortHash(hash, head = 10, tail = 8) {
  if (!hash) return '-'
  if (hash.length <= head + tail) return hash
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`
}

// 만 나이 계산 (birth_date 기준)
export function calcAge(birthDate) {
  if (!birthDate) return null
  const b = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age
}
