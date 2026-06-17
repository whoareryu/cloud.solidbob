import { Pill } from 'lucide-react'
import { formatDate } from '../../lib/format'

// 현재 복용약 목록 (처방 이력에서 파생)
export default function MedicationList({ meds }) {
  if (!meds.length) {
    return <p className="text-sm text-muted">현재 복용 중인 약물이 없습니다.</p>
  }
  return (
    <ul className="space-y-2">
      {meds.map((m) => (
        <li
          key={m.prescription_id}
          className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/10 text-teal">
            <Pill size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{m.drug_name}</p>
            <p className="text-xs text-muted">
              {m.dosage} · {m.duration_days}일분 · {formatDate(m.prescribed_date)} 처방
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
