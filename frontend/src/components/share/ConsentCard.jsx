import { useNavigate } from 'react-router-dom'
import Badge from '../common/Badge'
import { recipientLabel, formatDateTime } from '../../lib/format'

const STATUS = {
  issued: { tone: 'primary', label: '발급됨' },
  used: { tone: 'success', label: '사용됨' },
  expired: { tone: 'muted', label: '만료됨' },
  revoked: { tone: 'danger', label: '폐기됨' },
}

export default function ConsentCard({ consent }) {
  const navigate = useNavigate()
  const s = STATUS[consent.status] ?? STATUS.issued
  return (
    <button
      onClick={() => navigate(`/share/${consent.share_id}/qr`)}
      className="card flex w-full items-center justify-between gap-3 p-4 text-left transition active:scale-[0.99]"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">{recipientLabel(consent.recipient_type)}에게 공유</span>
          <Badge tone={s.tone}>{s.label}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          {consent.shared_items.length}개 항목 · {consent.disclosure_method.toUpperCase()}
        </p>
        <p className="mt-0.5 text-xs text-muted">발급 {formatDateTime(consent.issued_at)}</p>
      </div>
    </button>
  )
}
