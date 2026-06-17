import { useState } from 'react'
import { ShieldCheck, Building2, Siren, Lock, FileBadge, Check } from 'lucide-react'
import AppBar from '../common/AppBar'
import Button from '../common/Button'
import { useStaffStore } from '../../stores/useStaffStore'

// 역할별 기관 인증서(공동인증서) 정보
const CERTS = {
  clinic: {
    title: '의료진 단말 인증',
    icon: Building2,
    institution: '강남세브란스병원',
    dept: '외래 진료부',
    operator: '김도현 (의사 · 면허 12345)',
    did: 'did:web:clinic.demo:doctor',
    issuer: '한국전자인증(주)',
    serial: 'KECA-2026-0451-7782',
    validUntil: '2027-03-31',
  },
  er: {
    title: '응급실 단말 인증',
    icon: Siren,
    institution: '강남세브란스병원 응급의료센터',
    dept: '권역응급의료센터',
    operator: '이수진 (응급의학과 전문의)',
    did: 'did:web:er.gangnam.severance.org',
    issuer: '한국전자인증(주)',
    serial: 'KECA-2026-0451-9930',
    validUntil: '2027-03-31',
  },
}

const DEMO_PASSWORD = '1234'

// 의료진/응급실 단말 진입 게이트: 기관 인증서 선택 + 인증서 비밀번호 입력
export default function StaffCertAuth({ role }) {
  const cert = CERTS[role] ?? CERTS.clinic
  const Icon = cert.icon
  const authenticate = useStaffStore((s) => s.authenticate)

  const [selected, setSelected] = useState(true) // 인증서 선택됨
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900)) // 인증서 서명 검증 연출
    setLoading(false)
    if (password !== DEMO_PASSWORD) {
      setError('인증서 비밀번호가 일치하지 않습니다.')
      return
    }
    authenticate(role, {
      name: cert.institution,
      dept: cert.dept,
      operator: cert.operator,
      did: cert.did,
    })
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <AppBar title={cert.title} />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:mx-auto lg:w-full lg:max-w-md lg:px-8 pb-8 pt-4">
        <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={22} />
          <p className="text-sm text-ink">
            의료기관 단말은 <b>기관 인증서(공동인증서)</b>로 로그인해야 합니다. 모든 환자 데이터 접근은
            이 인증서 신원으로 기록됩니다.
          </p>
        </div>

        {/* 인증서 카드 */}
        <button
          onClick={() => setSelected(true)}
          className={`mt-4 w-full overflow-hidden rounded-2xl border bg-white p-4 text-left transition ${
            selected ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-ink">
              <FileBadge size={18} className="text-primary" /> 기관 인증서
            </span>
            {selected && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                <Check size={14} />
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{cert.institution}</p>
              <p className="truncate text-xs text-muted">{cert.dept} · {cert.operator}</p>
            </div>
          </div>
          <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-muted">
            <div className="flex justify-between"><dt>발급기관</dt><dd className="text-ink">{cert.issuer}</dd></div>
            <div className="flex justify-between"><dt>일련번호</dt><dd className="font-mono text-ink">{cert.serial}</dd></div>
            <div className="flex justify-between"><dt>유효기간</dt><dd className="text-ink">~ {cert.validUntil}</dd></div>
          </dl>
        </button>

        {/* 인증서 비밀번호 */}
        <label className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Lock size={14} /> 인증서 비밀번호
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && password && handleLogin()}
          placeholder="인증서 비밀번호 입력"
          className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 focus:border-primary focus:outline-none"
        />
        <p className="mt-1.5 text-xs text-muted">데모 비밀번호: <b className="font-mono">{DEMO_PASSWORD}</b></p>

        {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}

        <Button
          variant="primary"
          className="mt-4 w-full"
          disabled={!selected || !password}
          loading={loading}
          onClick={handleLogin}
        >
          <ShieldCheck size={18} /> 인증서로 로그인
        </Button>
      </main>
    </div>
  )
}
