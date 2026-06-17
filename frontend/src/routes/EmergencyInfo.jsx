import { useEffect, useState } from 'react'
import { Droplet, AlertCircle, Activity, Phone, Loader2, Plus, X, Eye } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import { useEmergencyStore } from '../stores/useEmergencyStore'

// 태그 편집기 (알러지/만성질환)
function TagEditor({ label, icon: Icon, tags, onAdd, onRemove, tone }) {
  const [value, setValue] = useState('')
  return (
    <div className="card p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        <Icon size={16} className={tone} /> {label}
      </p>
      <div className="mb-2 flex flex-wrap gap-2">
        {tags.length === 0 && <span className="text-sm text-muted">없음</span>}
        {tags.map((t) => (
          <span key={t} className="chip bg-surface text-ink">
            {t}
            <button onClick={() => onRemove(t)} className="text-muted hover:text-danger">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim()) {
              onAdd(value.trim())
              setValue('')
            }
          }}
          placeholder="추가 후 Enter"
          className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-3 text-sm focus:border-primary focus:outline-none"
        />
        <Button
          variant="outline"
          onClick={() => {
            if (value.trim()) {
              onAdd(value.trim())
              setValue('')
            }
          }}
        >
          <Plus size={18} />
        </Button>
      </div>
    </div>
  )
}

export default function EmergencyInfo() {
  const { info, loading, fetchInfo, updateInfo } = useEmergencyStore()

  useEffect(() => {
    fetchInfo()
  }, [fetchInfo])

  if (loading || !info) {
    return (
      <>
        <AppBar title="응급 의료정보" />
        <div className="flex flex-1 items-center justify-center text-muted">
          <Loader2 className="animate-spin" />
        </div>
      </>
    )
  }

  const addTo = (field, val) => updateInfo({ [field]: [...(info[field] ?? []), val] })
  const removeFrom = (field, val) =>
    updateInfo({ [field]: (info[field] ?? []).filter((x) => x !== val) })

  return (
    <>
      <AppBar title="응급 의료정보" />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-6 pt-3 space-y-3">
        {/* 혈액형 */}
        <div className="card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Droplet size={16} className="text-danger" /> 혈액형
          </p>
          <div className="flex flex-wrap gap-2">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bt) => (
              <button
                key={bt}
                onClick={() => updateInfo({ blood_type: bt })}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  info.blood_type === bt
                    ? 'border-danger bg-danger/5 text-danger'
                    : 'border-slate-200 text-muted'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        <TagEditor
          label="알러지"
          icon={AlertCircle}
          tone="text-amber-600"
          tags={info.allergies ?? []}
          onAdd={(v) => addTo('allergies', v)}
          onRemove={(v) => removeFrom('allergies', v)}
        />
        <TagEditor
          label="만성질환"
          icon={Activity}
          tone="text-primary"
          tags={info.chronic_conditions ?? []}
          onAdd={(v) => addTo('chronic_conditions', v)}
          onRemove={(v) => removeFrom('chronic_conditions', v)}
        />

        {/* 비상연락처 */}
        <div className="card p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Phone size={16} className="text-teal" /> 비상연락처
          </p>
          <input
            value={info.emergency_contact ?? ''}
            onChange={(e) => updateInfo({ emergency_contact: e.target.value })}
            className="min-h-[44px] w-full rounded-xl border border-slate-200 px-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {/* 응급 시 공개 미리보기 */}
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
            <Eye size={16} /> 응급 시 공개되는 항목
          </p>
          <p className="text-sm text-ink">
            혈액형 · 알러지 · 만성질환 · 현재 복용약. 응급실 단말에서 임시 권한으로만 열람되며 모두
            로그에 기록됩니다.
          </p>
        </div>
      </main>
    </>
  )
}
