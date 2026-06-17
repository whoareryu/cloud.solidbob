import { Eye, ShieldCheck, Share2, Siren } from 'lucide-react'
import Badge from '../common/Badge'
import { accessorLabel, accessTypeLabel, itemLabel, relativeTime } from '../../lib/format'

const ICON = {
  read: Eye,
  verify: ShieldCheck,
  share: Share2,
  emergency: Siren,
}

export default function AccessLogItem({ log }) {
  const Icon = ICON[log.access_type] ?? Eye
  const denied = log.result !== 'success'
  const isEmergency = log.access_type === 'emergency'
  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isEmergency ? 'bg-danger/10 text-danger' : 'bg-surface text-primary'
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink">
            {accessorLabel(log.accessor_type)} · {accessTypeLabel(log.access_type)}
          </p>
          {denied && <Badge tone="danger">차단됨</Badge>}
        </div>
        {Array.isArray(log.items) && log.items.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-muted">
            {log.items.map((i) => itemLabel(i)).join(', ')}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted">
          {relativeTime(log.accessed_at)} · {log.ip_address}
        </p>
      </div>
    </div>
  )
}
