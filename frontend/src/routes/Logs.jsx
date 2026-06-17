import { useEffect } from 'react'
import { ScrollText, Loader2 } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import EmptyState from '../components/common/EmptyState'
import AccessLogItem from '../components/share/AccessLogItem'
import { useLogStore } from '../stores/useLogStore'

export default function Logs() {
  const { logs, loading, fetchLogs } = useLogStore()

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <>
      <AppBar title="접근 로그" />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-6 pt-3">
        <p className="mb-2 text-sm text-muted">누가 · 언제 · 무엇을 열람했는지 모두 기록됩니다.</p>
        {loading ? (
          <div className="flex justify-center py-14 text-muted">
            <Loader2 className="animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="접근 기록이 없어요" />
        ) : (
          <div className="card divide-y divide-slate-100 px-4 py-1">
            {logs.map((log) => (
              <AccessLogItem key={log.log_id} log={log} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
