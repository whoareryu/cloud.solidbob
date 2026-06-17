import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Timer from '../components/common/Timer'
import ShareQR from '../components/share/ShareQR'
import { useShareStore } from '../stores/useShareStore'
import { recipientLabel, formatDateTime } from '../lib/format'

const STATUS_TONE = { issued: 'primary', used: 'success', expired: 'muted', revoked: 'danger' }
const STATUS_LABEL = { issued: '발급됨 · 대기 중', used: '사용 완료', expired: '만료됨', revoked: '폐기됨' }

export default function ShareQrPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getConsent, revoke } = useShareStore()
  const [consent, setConsent] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const c = await getConsent(id)
    setConsent(c)
    setLoading(false)
  }, [id, getConsent])

  useEffect(() => {
    load()
    // clinic 이 다른 역할에서 소비하면 상태가 바뀌므로 폴링으로 반영
    const t = setInterval(load, 1500)
    return () => clearInterval(t)
  }, [load])

  if (loading) {
    return (
      <>
        <AppBar title="공유 QR" back />
        <div className="flex flex-1 items-center justify-center text-muted">
          <Loader2 className="animate-spin" />
        </div>
      </>
    )
  }
  if (!consent) {
    return (
      <>
        <AppBar title="공유 QR" back />
        <p className="p-6 text-center text-muted">공유 정보를 찾을 수 없습니다.</p>
      </>
    )
  }

  const active = consent.status === 'issued'
  const dimmed = consent.status === 'used' || consent.status === 'expired' || consent.status === 'revoked'

  return (
    <>
      <AppBar title="일회성 공유 QR" back />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">
              {recipientLabel(consent.recipient_type)}에게 공유
            </p>
            <p className="text-xs text-muted">
              {consent.shared_items.length}개 항목 · {consent.disclosure_method.toUpperCase()}
            </p>
          </div>
          <Badge tone={STATUS_TONE[consent.status]}>{STATUS_LABEL[consent.status]}</Badge>
        </div>

        <ShareQR token={consent.token} dimmed={dimmed} />

        {/* PC 단말용: 공유 ID + 인증번호 (QR 스캔이 어려운 데스크톱 대안) */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-muted">
            QR 대신 직접 입력 (의료진 PC에서 사용)
          </p>
          <div className="flex items-stretch gap-2">
            <div className="flex-1 rounded-xl bg-surface px-3 py-2 text-center">
              <p className="text-[11px] text-muted">공유 ID</p>
              <p className="font-mono text-lg font-bold tracking-wider text-ink">{consent.share_ref}</p>
            </div>
            <div className="flex-1 rounded-xl bg-surface px-3 py-2 text-center">
              <p className="text-[11px] text-muted">인증번호</p>
              <p className={`font-mono text-lg font-bold tracking-[0.2em] ${dimmed ? 'text-muted line-through' : 'text-primary'}`}>
                {consent.share_code}
              </p>
            </div>
          </div>
        </div>

        {/* 타이머 / 상태 */}
        <div className="mt-5 flex items-center justify-center">
          {active ? (
            <div className="text-center">
              <p className="text-xs text-muted">만료까지</p>
              <Timer expiresAt={consent.expires_at} onExpire={load} />
            </div>
          ) : consent.status === 'used' ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 size={20} />
              <span className="font-semibold">{formatDateTime(consent.used_at)} 열람됨 · 토큰 소멸</span>
            </div>
          ) : (
            <span className="font-semibold text-muted">사용 불가</span>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-surface p-3 text-xs text-muted">
          <ShieldCheck size={16} className="shrink-0 text-teal" />
          1회 열람 후 토큰이 자동 소멸됩니다. 의료진 단말(역할: 의료진)에서 스캔해 보세요.
        </div>

        {active && (
          <Button variant="ghost" className="mt-4 w-full" onClick={async () => { await revoke(id); load() }}>
            공유 취소(폐기)
          </Button>
        )}
        <Button variant="outline" className="mt-2 w-full" onClick={() => navigate('/share/history')}>
          공유 이력 보기
        </Button>
      </main>
    </>
  )
}
