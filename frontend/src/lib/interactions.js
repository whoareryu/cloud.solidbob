// 약물충돌 판정. 백엔드 medical_record 의 drug_interactions 테이블에 대응.
// drug_code_a / drug_code_b 쌍과 severity 로 판정한다.

// 신규 약물코드 vs 현재 복용 약물코드 목록을 대조해 충돌 목록 반환.
export function findInteractions(newDrugCode, currentDrugCodes, interactions, drugsById) {
  const hits = []
  for (const code of currentDrugCodes) {
    const match = interactions.find(
      (it) =>
        (it.drug_code_a === newDrugCode && it.drug_code_b === code) ||
        (it.drug_code_b === newDrugCode && it.drug_code_a === code),
    )
    if (match) {
      hits.push({
        ...match,
        new_drug: drugsById[newDrugCode]?.drug_name ?? newDrugCode,
        existing_drug: drugsById[code]?.drug_name ?? code,
      })
    }
  }
  // severity 높은 순으로 정렬
  const rank = { high: 3, moderate: 2, low: 1 }
  return hits.sort((a, b) => (rank[b.severity] ?? 0) - (rank[a.severity] ?? 0))
}
