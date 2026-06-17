// 응급 AI 요약 — 규칙 기반 목업. **백엔드/실제 LLM 교체 지점**.
// 추후 Claude API 등으로 대체할 때 이 함수 시그니처만 유지하면 된다.

import { calcAge } from './format'

// 환자 핵심정보 → 의료진용 한 줄 요약 + 주의 포인트 배열
export function summarizeEmergency({ user, emergencyInfo, currentMeds, interactions }) {
  const age = calcAge(user?.birth_date)
  const parts = []
  if (age != null) parts.push(`${age}세`)
  if (emergencyInfo?.blood_type) parts.push(`혈액형 ${emergencyInfo.blood_type}`)

  const chronic = emergencyInfo?.chronic_conditions ?? []
  const allergies = emergencyInfo?.allergies ?? []
  if (chronic.length) parts.push(chronic.join('·'))
  if (allergies.length) parts.push(`${allergies.join('·')} 알러지`)

  const medNames = currentMeds.map((m) => m.drug_name)
  if (medNames.length) parts.push(`현재 ${medNames.join('·')} 복용 중`)

  // 현재 복용약 사이의 잠재 충돌 경고
  const warnings = []
  for (let i = 0; i < currentMeds.length; i++) {
    for (let j = i + 1; j < currentMeds.length; j++) {
      const a = currentMeds[i].drug_code
      const b = currentMeds[j].drug_code
      const hit = interactions.find(
        (it) =>
          (it.drug_code_a === a && it.drug_code_b === b) ||
          (it.drug_code_a === b && it.drug_code_b === a),
      )
      if (hit) warnings.push(hit.description)
    }
  }

  let summary = parts.join(', ')
  if (allergies.length) summary += ` — 항생제 처방 시 ${allergies[0]} 교차반응 주의`
  if (warnings.length) summary += ` / ${warnings[0]}`

  return {
    summary: summary || '특이 의료정보 없음',
    highlights: {
      blood_type: emergencyInfo?.blood_type ?? '미상',
      allergies,
      chronic_conditions: chronic,
      medications: medNames,
    },
    warnings,
  }
}
