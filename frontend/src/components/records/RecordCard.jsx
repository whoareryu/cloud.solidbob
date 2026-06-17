import { useNavigate } from 'react-router-dom'
import { Stethoscope, Pill, FlaskConical, HeartPulse, ScanLine } from 'lucide-react'
import IntegrityBadge from './IntegrityBadge'
import { categoryLabel, formatDate } from '../../lib/format'

// 카테고리별 그라데이션 + 아이콘 (참조 이미지 Curity 카드 스타일)
const CATEGORY_STYLE = {
  diagnosis: { icon: Stethoscope, grad: 'from-[#0F6FFF] to-[#0B3A99]' },
  prescription: { icon: Pill, grad: 'from-[#0FB5AE] to-[#0B6E69]' },
  lab_test: { icon: FlaskConical, grad: 'from-[#7C3AED] to-[#DB2777]' },
  checkup: { icon: HeartPulse, grad: 'from-[#0EA5E9] to-[#1E3A8A]' },
  imaging: { icon: ScanLine, grad: 'from-[#475569] to-[#0B1324]' },
}

export default function RecordCard({ record, institutionName }) {
  const navigate = useNavigate()
  const style = CATEGORY_STYLE[record.category] ?? CATEGORY_STYLE.diagnosis
  const Icon = style.icon
  const verified = !!record.integrity_hash

  return (
    <button
      onClick={() => navigate(`/records/${record.record_id}`)}
      className={`relative w-full overflow-hidden rounded-2xl bg-gradient-to-br ${style.grad} p-4 text-left text-white shadow-card transition active:scale-[0.99]`}
    >
      {/* 장식 패턴 */}
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Icon size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">
            {categoryLabel(record.category)} · {formatDate(record.visit_date)}
          </p>
          <p className="mt-0.5 truncate font-bold">{record.title}</p>
          <p className="mt-0.5 truncate text-xs text-white/75">{institutionName}</p>
        </div>
      </div>
      <div className="relative mt-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            verified ? 'bg-white/20 text-white' : 'bg-black/20 text-white/80'
          }`}
        >
          {verified ? '🛡 블록체인 검증됨' : '· 미검증'}
        </span>
      </div>
    </button>
  )
}
