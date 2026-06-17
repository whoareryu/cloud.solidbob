import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Loader2 } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import IntegrityBadge from '../components/records/IntegrityBadge'
import AnchorDetail from '../components/records/AnchorDetail'
import { useRecordsStore } from '../stores/useRecordsStore'
import { useLogStore } from '../stores/useLogStore'
import { categoryLabel, formatDate } from '../lib/format'

export default function RecordDetail() {
  const { id } = useParams()
  const { getRecord, getAnchor, getChainConfig, allInstitutions } = useRecordsStore()
  const addLog = useLogStore((s) => s.addLog)

  const [record, setRecord] = useState(null)
  const [anchor, setAnchor] = useState(null)
  const [chainConfig, setChainConfig] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    ;(async () => {
      const rec = await getRecord(id)
      if (!active) return
      setRecord(rec)
      if (rec) {
        const a = await getAnchor(id)
        if (!active) return
        setAnchor(a)
        if (a) setChainConfig(await getChainConfig(a.chain_network))
        // 본인 열람 로그
        addLog({ accessor_type: 'patient', access_type: 'read', record_id: id, items: null,
          accessor_did: 'did:web:vitalink.io:user:jiwon' })
      }
      if (active) setLoading(false)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const inst = record && allInstitutions.find((i) => i.institution_id === record.institution_id)

  if (loading) {
    return (
      <>
        <AppBar title="진료기록" back />
        <div className="flex flex-1 items-center justify-center text-muted">
          <Loader2 className="animate-spin" />
        </div>
      </>
    )
  }
  if (!record) {
    return (
      <>
        <AppBar title="진료기록" back />
        <p className="p-6 text-center text-muted">기록을 찾을 수 없습니다.</p>
      </>
    )
  }

  return (
    <>
      <AppBar title="진료기록 상세" back />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-8 pt-4">
        {/* 헤더 카드 */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#DB2777] p-5 text-white shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-white/70">
            {categoryLabel(record.category)} · {record.fhir_resource_type}
          </p>
          <h1 className="mt-1 text-lg font-extrabold">{record.title}</h1>
          <p className="mt-2 text-sm text-white/85">{record.summary}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-white/70">
            <span>{inst?.name}</span>
            <span>{formatDate(record.visit_date)}</span>
          </div>
        </div>

        {/* 무결성 배지 (탭하면 앵커 상세 토글) */}
        <div className="mt-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-success/20 bg-success/5 px-4 py-3"
          >
            <IntegrityBadge verified={!!anchor && anchor.status === 'anchored'} size="lg" />
            <ChevronDown
              size={20}
              className={`text-muted transition ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {open && anchor && (
          <div className="mt-3 animate-fade-in">
            <AnchorDetail record={record} anchor={anchor} chainConfig={chainConfig} />
          </div>
        )}
        {open && !anchor && (
          <p className="mt-3 rounded-2xl bg-surface p-4 text-sm text-muted">
            아직 앵커링되지 않은 기록입니다.
          </p>
        )}
      </main>
    </>
  )
}
