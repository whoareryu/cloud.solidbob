import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Siren, Loader2 } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import RecordTimeline from '../components/records/RecordTimeline'
import EmptyState from '../components/common/EmptyState'
import { useRecordsStore } from '../stores/useRecordsStore'
import { useAuthStore } from '../stores/useAuthStore'
import { useLogStore } from '../stores/useLogStore'

export default function Home() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { records, institutions, allInstitutions, loading, fetchRecords, fetchUnconnected } =
    useRecordsStore()
  const { logs, fetchLogs, emergencyCount } = useLogStore()

  useEffect(() => {
    fetchRecords()
    fetchUnconnected()
    fetchLogs()
  }, [fetchRecords, fetchUnconnected, fetchLogs])

  const institutionsById = useMemo(
    () => Object.fromEntries(allInstitutions.map((i) => [i.institution_id, i])),
    [allInstitutions],
  )
  const emCount = emergencyCount()

  return (
    <>
      <AppBar
        right={
          <button
            onClick={() => navigate('/connect')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-label="기관 연동"
          >
            <Plus size={20} />
          </button>
        }
      />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-6">
        <div className="py-3">
          <p className="text-sm text-muted">안녕하세요,</p>
          <h1 className="text-xl font-extrabold text-ink">{user?.name ?? '사용자'}님</h1>
        </div>

        {emCount > 0 && (
          <button
            onClick={() => navigate('/logs')}
            className="mb-3 flex w-full items-center gap-2 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-left text-danger animate-fade-in"
          >
            <Siren size={18} />
            <span className="text-sm font-semibold">
              응급 열람 {emCount}건 발생 — 접근 로그 확인
            </span>
          </button>
        )}

        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-muted">진료기록</h2>
          {institutions.length > 0 && (
            <button onClick={() => navigate('/connect')} className="text-xs font-semibold text-primary">
              + 기관 연동 ({institutions.length})
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-14 text-muted">
            <Loader2 className="animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="아직 진료기록이 없어요"
            description="의료기관을 연동해 기록을 수집하세요."
          />
        ) : (
          <RecordTimeline records={records} institutionsById={institutionsById} />
        )}
      </main>
    </>
  )
}
