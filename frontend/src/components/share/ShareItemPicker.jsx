import { Check } from 'lucide-react'
import { recipientLabel, categoryLabel, formatDate } from '../../lib/format'

const RECIPIENTS = ['doctor', 'hospital', 'insurer']
const METHODS = [
  { key: 'sd_jwt', label: 'SD-JWT (선택적 공개)', desc: '필요한 항목만 선택 공개' },
  { key: 'full', label: '전체 공개', desc: '선택 기록 전체 공개' },
]

// 수신자 유형 + 공유 항목(기록) + 공개 방식 선택
export default function ShareItemPicker({
  records,
  recipientType,
  setRecipientType,
  selected,
  toggle,
  method,
  setMethod,
}) {
  return (
    <div className="space-y-5">
      {/* 수신자 유형 */}
      <section>
        <p className="mb-2 text-sm font-semibold text-ink">수신자 유형</p>
        <div className="flex gap-2">
          {RECIPIENTS.map((r) => (
            <button
              key={r}
              onClick={() => setRecipientType(r)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                recipientType === r
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-200 text-muted'
              }`}
            >
              {recipientLabel(r)}
            </button>
          ))}
        </div>
      </section>

      {/* 공유 항목 */}
      <section>
        <p className="mb-2 text-sm font-semibold text-ink">공유 항목</p>
        <div className="space-y-2">
          {records.map((rec) => {
            const checked = selected.includes(rec.record_id)
            return (
              <button
                key={rec.record_id}
                onClick={() => toggle(rec.record_id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                  checked ? 'border-primary bg-primary/5' : 'border-slate-200'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    checked ? 'border-primary bg-primary text-white' : 'border-slate-300'
                  }`}
                >
                  {checked && <Check size={14} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{rec.title}</span>
                  <span className="block text-xs text-muted">
                    {categoryLabel(rec.category)} · {formatDate(rec.visit_date)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 공개 방식 */}
      <section>
        <p className="mb-2 text-sm font-semibold text-ink">공개 방식</p>
        <div className="space-y-2">
          {METHODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                method === m.key ? 'border-teal bg-teal/5' : 'border-slate-200'
              }`}
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{m.label}</span>
                <span className="block text-xs text-muted">{m.desc}</span>
              </span>
              {method === m.key && <Check size={18} className="text-teal" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
