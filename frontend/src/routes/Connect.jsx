import { useEffect, useState } from 'react'
import { Building2, Pill, Hospital, Landmark, Loader2, CheckCircle2 } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import { useRecordsStore } from '../stores/useRecordsStore'

const TYPE_ICON = {
  hospital: Hospital,
  clinic: Building2,
  pharmacy: Pill,
  public: Landmark,
}

export default function Connect() {
  const { institutions, connecting, fetchUnconnected, connectInstitution } = useRecordsStore()
  const [done, setDone] = useState([]) // 방금 연동 완료한 institution_id + 수집 건수

  useEffect(() => {
    fetchUnconnected()
  }, [fetchUnconnected])

  const handleConnect = async (inst) => {
    const collected = await connectInstitution(inst.institution_id)
    setDone((d) => [...d, { id: inst.institution_id, name: inst.name, count: collected.length }])
  }

  return (
    <>
      <AppBar title="의료기관 연동" back />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-6 pt-3">
        <p className="mb-4 text-sm text-muted">
          기관을 연동하면 FHIR 표준으로 진료기록을 수집하고, 자동으로 블록체인에 앵커링합니다.
        </p>

        {done.length > 0 && (
          <div className="mb-4 space-y-2">
            {done.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-success animate-fade-in"
              >
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">
                  {d.name} 연동 완료 — {d.count}건 수집 · 앵커링됨
                </span>
              </div>
            ))}
          </div>
        )}

        {institutions.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="연동 가능한 기관이 없어요"
            description="모든 기관이 연동되었습니다."
          />
        ) : (
          <div className="space-y-3">
            {institutions.map((inst) => {
              const Icon = TYPE_ICON[inst.type] ?? Building2
              const busy = connecting === inst.institution_id
              return (
                <div key={inst.institution_id} className="card flex items-center gap-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-primary">
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{inst.name}</p>
                    <p className="text-xs text-muted">{inst.region}</p>
                  </div>
                  <Button variant="outline" onClick={() => handleConnect(inst)} loading={busy}>
                    {busy ? '수집 중' : '연동'}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
