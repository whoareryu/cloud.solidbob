import { AlertTriangle, ShieldCheck } from 'lucide-react'
import Modal from '../common/Modal'
import Button from '../common/Button'

const SEVERITY = {
  high: { tone: 'text-danger', bg: 'bg-danger/10', label: '높음 (HIGH)' },
  moderate: { tone: 'text-amber-700', bg: 'bg-warn/10', label: '중간 (MODERATE)' },
  low: { tone: 'text-muted', bg: 'bg-slate-100', label: '낮음 (LOW)' },
}

// 약물충돌 경고 모달. hits 가 비어있으면 안전.
export default function InteractionAlert({ open, onClose, newDrugName, hits }) {
  const hasConflict = hits && hits.length > 0
  const top = hasConflict ? SEVERITY[hits[0].severity] ?? SEVERITY.low : null

  return (
    <Modal open={open} onClose={onClose} hideClose title={hasConflict ? '⚠ 약물충돌 경고' : '처방 검토'}>
      {hasConflict ? (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 rounded-xl ${top.bg} px-3 py-2 ${top.tone}`}>
            <AlertTriangle size={20} />
            <span className="text-sm font-bold">상호작용 {hits.length}건 · 최고 위험도 {top.label}</span>
          </div>
          {hits.map((h, i) => {
            const s = SEVERITY[h.severity] ?? SEVERITY.low
            return (
              <div key={i} className="rounded-xl border border-slate-100 p-3">
                <p className={`text-sm font-bold ${s.tone}`}>
                  {h.new_drug} + {h.existing_drug} · {s.label}
                </p>
                <p className="mt-1 text-sm text-ink">{h.description}</p>
              </div>
            )
          })}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" className="flex-1" onClick={onClose}>
              취소
            </Button>
            <Button variant="danger" className="flex-1" onClick={onClose}>
              위험 인지 후 처방
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-success">
            <ShieldCheck size={20} />
            <span className="text-sm font-bold">{newDrugName}: 충돌 없음</span>
          </div>
          <p className="text-sm text-muted">현재 복용약과의 알려진 상호작용이 없습니다.</p>
          <Button variant="primary" className="w-full" onClick={onClose}>
            처방 확정
          </Button>
        </div>
      )}
    </Modal>
  )
}
