import RecordCard from './RecordCard'
import { formatDate } from '../../lib/format'

// 진료기록을 방문일 내림차순 카드로 표시
export default function RecordTimeline({ records, institutionsById }) {
  const sorted = [...records].sort(
    (a, b) => new Date(b.visit_date) - new Date(a.visit_date),
  )
  return (
    <div className="space-y-3">
      {sorted.map((rec) => (
        <RecordCard
          key={rec.record_id}
          record={rec}
          institutionName={institutionsById[rec.institution_id]?.name ?? '연동 기관'}
        />
      ))}
    </div>
  )
}
