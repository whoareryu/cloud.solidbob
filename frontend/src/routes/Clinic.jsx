import { useEffect, useState } from 'react'
import { ScanLine, Loader2, CheckCircle2, XCircle, FileText, Stethoscope, KeyRound, LogOut } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Badge from '../components/common/Badge'
import { useShareStore } from '../stores/useShareStore'
import { useStaffStore } from '../stores/useStaffStore'
import { categoryLabel, formatDate, itemLabel } from '../lib/format'

// 의료진 단말: ① QR 스캔  ② 공유 ID + 인증번호 입력 → 토큰 검증 → 허용 항목 열람 → 토큰 소멸
export default function Clinic() {
  const { consents, fetchConsents, consumeToken, consumeByCode } = useShareStore()
  const staff = useStaffStore((s) => s.institution.clinic)
  const signOut = useStaffStore((s) => s.signOut)
  const [method, setMethod] = useState('qr') // 'qr' | 'code'
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [shareRef, setShareRef] = useState('')
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchConsents()
  }, [fetchConsents])

  // 데모: 가장 최근 발급된(issued) 공유 토큰을 "스캔" 대상으로 삼는다.
  const target = consents.find((c) => c.status === 'issued')
  const lastUsed = consents.find((c) => c.status === 'used')

  const handleScan = async () => {
    setScanning(true)
    const token = (target ?? lastUsed)?.token
    if (!token) {
      setResult({ redeemed: false, reason: '스캔할 공유 QR이 없습니다. 환자 역할에서 QR을 먼저 생성하세요.', shared_items: [] })
      setScanning(false)
      return
    }
    await new Promise((r) => setTimeout(r, 700)) // 카메라 스캔 연출
    setResult(await consumeToken(token))
    setScanning(false)
  }

  const handleVerifyCode = async () => {
    setVerifying(true)
    setResult(await consumeByCode(shareRef, code))
    setVerifying(false)
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <AppBar
        title="의료진 단말"
        right={
          <button
            onClick={() => signOut('clinic')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface"
            aria-label="인증 해제"
          >
            <LogOut size={18} />
          </button>
        }
      />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-8 pt-4">
        <div className="card flex items-center gap-3 p-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Stethoscope size={22} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{staff?.name ?? '강남세브란스병원'}</p>
            <p className="truncate text-xs text-muted">{staff?.operator ?? staff?.did ?? 'did:web:clinic.demo:doctor'}</p>
          </div>
        </div>

        {/* 인증 방식 선택 */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { key: 'qr', label: 'QR 스캔', icon: ScanLine },
            { key: 'code', label: '공유 ID + 인증번호', icon: KeyRound },
          ].map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.key}
                onClick={() => {
                  setMethod(m.key)
                  setResult(null)
                }}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  method === m.key ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-muted'
                }`}
              >
                <Icon size={16} /> {m.label}
              </button>
            )
          })}
        </div>

        {/* QR 스캔 */}
        {method === 'qr' && (
          <div className="mt-4 flex flex-col items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-8">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-2xl bg-ink/5">
              <ScanLine size={56} className={`text-primary ${scanning ? 'animate-pulse' : ''}`} />
              {scanning && <span className="absolute left-2 right-2 top-2 h-0.5 animate-bounce bg-primary" />}
            </div>
            <p className="mt-3 text-sm text-muted">
              {target ? '공유 QR이 감지되었습니다' : '대기 중인 공유 QR 없음'}
            </p>
            <Button variant="primary" className="mt-4" onClick={handleScan} loading={scanning}>
              <ScanLine size={18} /> QR 스캔 (시뮬레이트)
            </Button>
          </div>
        )}

        {/* 공유 ID + 인증번호 입력 (PC 단말) */}
        {method === 'code' && (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-muted">
              환자가 화면에 표시한 <b>공유 ID</b>와 <b>인증번호</b>를 입력해 의료데이터를 1회 열람합니다.
            </p>
            <label className="mt-4 block text-xs font-semibold text-ink">공유 ID</label>
            <input
              value={shareRef}
              onChange={(e) => setShareRef(e.target.value)}
              placeholder="예: VL-3A9F"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono uppercase tracking-wider focus:border-primary focus:outline-none"
            />
            <label className="mt-3 block text-xs font-semibold text-ink">인증번호 (6자리)</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="예: 123456"
              className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono text-lg tracking-[0.3em] focus:border-primary focus:outline-none"
            />
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={handleVerifyCode}
              loading={verifying}
              disabled={!shareRef.trim() || code.length < 6}
            >
              <KeyRound size={18} /> 인증 후 열람
            </Button>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="mt-5 animate-fade-in">
            {result.redeemed ? (
              <>
                <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-success">
                  <CheckCircle2 size={20} />
                  <span className="font-semibold">{result.reason}</span>
                </div>
                <p className="mb-2 mt-4 text-sm font-bold text-muted">공유된 항목</p>
                <div className="space-y-2">
                  {result.shared_items.map((item, i) =>
                    item.type === 'record' ? (
                      <div key={i} className="card p-4">
                        <div className="flex items-center justify-between">
                          <Badge tone="primary">{categoryLabel(item.category)}</Badge>
                          <span className="text-xs text-muted">{formatDate(item.visit_date)}</span>
                        </div>
                        <p className="mt-1 font-semibold text-ink">{item.title}</p>
                        <p className="text-xs text-muted">{item.institution_name}</p>
                        {item.summary && <p className="mt-1 text-sm text-ink">{item.summary}</p>}
                      </div>
                    ) : (
                      <div key={i} className="card p-4">
                        <p className="text-sm font-semibold text-ink">{itemLabel(item.key)}</p>
                        <p className="text-sm text-muted">
                          {Array.isArray(item.value) ? item.value.join(', ') : String(item.value ?? '-')}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-danger/10 px-4 py-3 text-danger">
                <XCircle size={20} />
                <span className="font-semibold">{result.reason}</span>
              </div>
            )}
          </div>
        )}

        {method === 'qr' && !result && !target && (
          <EmptyState
            icon={FileText}
            title="공유 QR을 기다리는 중"
            description="환자 역할로 전환해 1회용 QR을 생성한 뒤 다시 스캔하세요."
          />
        )}
      </main>
    </div>
  )
}
