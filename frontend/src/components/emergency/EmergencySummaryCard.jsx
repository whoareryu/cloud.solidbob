import { Sparkles, Droplet, AlertCircle, Activity } from 'lucide-react'
import VitalChip from './VitalChip'
import MedicationList from './MedicationList'

// 응급 요약 카드: AI 한 줄 요약 + 바이탈 칩 + 복용약
export default function EmergencySummaryCard({ user, ai, info, meds }) {
  return (
    <div className="space-y-4">
      {/* AI 요약 */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1324] to-[#1E3A8A] p-4 text-white shadow-card">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-teal">
          <Sparkles size={14} /> AI 응급 요약
        </div>
        <p className="mt-2 text-sm leading-relaxed">{ai.summary}</p>
        {user && (
          <p className="mt-2 text-xs text-white/60">
            {user.name} · {user.did}
          </p>
        )}
      </div>

      {/* 바이탈 칩 */}
      <div className="grid grid-cols-2 gap-2">
        <VitalChip icon={Droplet} label="혈액형" value={info?.blood_type ?? '미상'} tone="danger" />
        <VitalChip
          icon={Activity}
          label="만성질환"
          value={(info?.chronic_conditions ?? []).join(', ') || '없음'}
          tone="primary"
        />
        <div className="col-span-2">
          <VitalChip
            icon={AlertCircle}
            label="알러지"
            value={(info?.allergies ?? []).join(', ') || '없음'}
            tone="warn"
          />
        </div>
      </div>

      {/* 복용약 */}
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">현재 복용약</p>
        <MedicationList meds={meds} />
      </div>
    </div>
  )
}
