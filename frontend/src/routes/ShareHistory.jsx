import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Share2, Plus, Loader2 } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import ConsentCard from '../components/share/ConsentCard'
import { useShareStore } from '../stores/useShareStore'

export default function ShareHistory() {
  const navigate = useNavigate()
  const { consents, loading, fetchConsents } = useShareStore()

  useEffect(() => {
    fetchConsents()
  }, [fetchConsents])

  return (
    <>
      <AppBar
        title="공유 이력"
        right={
          <button
            onClick={() => navigate('/share/new')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-label="새 공유"
          >
            <Plus size={20} />
          </button>
        }
      />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-6 pt-3">
        {loading ? (
          <div className="flex justify-center py-14 text-muted">
            <Loader2 className="animate-spin" />
          </div>
        ) : consents.length === 0 ? (
          <EmptyState
            icon={Share2}
            title="공유 이력이 없어요"
            description="필요한 항목만 1회용 QR로 안전하게 공유하세요."
            action={
              <Button variant="primary" onClick={() => navigate('/share/new')}>
                <Plus size={18} /> 데이터 공유하기
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {consents.map((c) => (
              <ConsentCard key={c.share_id} consent={c} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
