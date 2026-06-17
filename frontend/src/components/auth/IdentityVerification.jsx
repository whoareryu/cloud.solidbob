import { useState } from 'react'
import { ChevronLeft, Check, Smartphone, ShieldCheck, Loader2, MessageSquare } from 'lucide-react'
import Button from '../common/Button'
import Timer from '../common/Timer'
import { sendVerificationCode, confirmVerificationCode } from '../../lib/did'
import { verifyIdentity } from '../../mocks/api'

const CARRIERS = ['SKT', 'KT', 'LG U+', '알뜰폰']

// 주민번호 앞6자리 + 성별코드 → 생년월일 ISO (YYYY-MM-DD)
function toBirthISO(front, gender) {
  if (front.length !== 6) return null
  const century = ['1', '2', '5', '6'].includes(gender) ? '19' : '20'
  return `${century}${front.slice(0, 2)}-${front.slice(2, 4)}-${front.slice(4, 6)}`
}

const TERMS = [
  { key: 'service', label: '본인확인 서비스 이용약관 동의' },
  { key: 'privacy', label: '개인정보 수집·이용 동의' },
  { key: 'unique', label: '고유식별정보 처리 동의' },
  { key: 'telecom', label: '통신사 이용약관 동의' },
]

// 휴대폰 본인인증 플로우: 약관동의 → 정보입력 → 인증번호 입력 → 완료
export default function IdentityVerification({ onVerified, onCancel }) {
  const [step, setStep] = useState('agree') // agree | info | code
  const [agreed, setAgreed] = useState({})
  // 데모 일관성: 시드 환자(김지원, 1971-08-14)에 맞춰 프리필
  const [name, setName] = useState('김지원')
  const [rrnFront, setRrnFront] = useState('710814')
  const [rrnGender, setRrnGender] = useState('1')
  const [carrier, setCarrier] = useState('SKT')
  const [phone, setPhone] = useState('01098765432')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sentCode, setSentCode] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const allAgreed = TERMS.every((t) => agreed[t.key])
  const infoValid = name.trim() && rrnFront.length === 6 && rrnGender && carrier && phone.length >= 10

  const toggleAll = () => {
    const next = !allAgreed
    setAgreed(Object.fromEntries(TERMS.map((t) => [t.key, next])))
  }

  const handleSend = async () => {
    setSending(true)
    setError('')
    const res = await sendVerificationCode({ name, carrier, phone, birth: `19${rrnFront.slice(0, 2)}-${rrnFront.slice(2, 4)}-${rrnFront.slice(4, 6)}` })
    setSentCode(res.code)
    setExpiresAt(res.expiresAt)
    setInput('')
    setSending(false)
    setStep('code')
  }

  const handleConfirm = async () => {
    setVerifying(true)
    setError('')
    // 1) SMS 인증번호 검증
    const res = await confirmVerificationCode(input)
    if (!res.ok) {
      setVerifying(false)
      setError(res.reason)
      return
    }
    // 2) 입력값(이름+생년월일)을 등록 회원과 대조 — 불일치 시 실패
    const birth = toBirthISO(rrnFront, rrnGender)
    const match = await verifyIdentity({ name: name.trim(), birth })
    setVerifying(false)
    if (!match.matched) {
      setError('입력하신 정보가 등록된 회원 정보와 일치하지 않습니다. 이름·주민번호를 확인해 주세요.')
      return
    }
    onVerified?.({ did: match.user.did, user: match.user, profile: { name, phone, birth } })
  }

  const back = () => {
    setError('')
    if (step === 'agree') onCancel?.()
    else if (step === 'info') setStep('agree')
    else setStep('info')
  }

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-2 pb-2">
        <button onClick={back} className="rounded-full p-1.5 text-ink hover:bg-surface" aria-label="뒤로">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-ink">휴대폰 본인인증</h1>
      </div>

      {/* 진행 표시 */}
      <div className="mb-4 flex gap-1.5">
        {['agree', 'info', 'code'].map((s, i) => {
          const order = { agree: 0, info: 1, code: 2 }
          return (
            <span
              key={s}
              className={`h-1.5 flex-1 rounded-full ${order[step] >= i ? 'bg-primary' : 'bg-slate-200'}`}
            />
          )
        })}
      </div>

      {/* STEP 1: 약관 동의 */}
      {step === 'agree' && (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary" size={22} />
            <p className="text-sm text-ink">
              안전한 의료데이터 보관을 위해 휴대폰으로 본인 확인을 진행합니다. 인증 후 나만의 DID가
              발급됩니다.
            </p>
          </div>

          <button
            onClick={toggleAll}
            className={`mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left ${
              allAgreed ? 'border-primary bg-primary/5' : 'border-slate-200'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${allAgreed ? 'bg-primary text-white' : 'bg-slate-200 text-white'}`}>
              <Check size={16} />
            </span>
            <span className="font-bold text-ink">약관 전체 동의</span>
          </button>

          <div className="mt-2 space-y-1">
            {TERMS.map((t) => (
              <button
                key={t.key}
                onClick={() => setAgreed((a) => ({ ...a, [t.key]: !a[t.key] }))}
                className="flex w-full items-center gap-3 px-2 py-2.5 text-left"
              >
                <span className={agreed[t.key] ? 'text-primary' : 'text-slate-300'}>
                  <Check size={18} />
                </span>
                <span className="text-sm text-ink">
                  <span className="text-danger">[필수]</span> {t.label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4">
            <Button variant="primary" className="w-full" disabled={!allAgreed} onClick={() => setStep('info')}>
              동의하고 계속
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: 정보 입력 */}
      {step === 'info' && (
        <div className="flex flex-1 flex-col">
          <label className="text-xs font-semibold text-ink">이름</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 focus:border-primary focus:outline-none"
          />

          <label className="mt-3 text-xs font-semibold text-ink">주민등록번호</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              value={rrnFront}
              onChange={(e) => setRrnFront(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              placeholder="앞 6자리"
              className="min-h-[44px] w-full flex-1 rounded-xl border border-slate-200 px-3 font-mono tracking-wider focus:border-primary focus:outline-none"
            />
            <span className="text-muted">-</span>
            <div className="flex items-center gap-1">
              <input
                value={rrnGender}
                onChange={(e) => setRrnGender(e.target.value.replace(/\D/g, '').slice(0, 1))}
                inputMode="numeric"
                className="min-h-[44px] w-11 rounded-xl border border-slate-200 text-center font-mono focus:border-primary focus:outline-none"
              />
              <span className="font-mono tracking-widest text-slate-400">●●●●●●</span>
            </div>
          </div>

          <label className="mt-3 text-xs font-semibold text-ink">통신사</label>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {CARRIERS.map((c) => (
              <button
                key={c}
                onClick={() => setCarrier(c)}
                className={`min-h-[44px] rounded-xl border text-sm font-semibold transition ${
                  carrier === c ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="mt-3 text-xs font-semibold text-ink">휴대폰 번호</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            inputMode="numeric"
            placeholder="01012345678"
            className="mt-1 min-h-[44px] w-full rounded-xl border border-slate-200 px-3 font-mono tracking-wider focus:border-primary focus:outline-none"
          />

          <div className="mt-auto pt-4">
            <Button variant="primary" className="w-full" disabled={!infoValid} loading={sending} onClick={handleSend}>
              <MessageSquare size={18} /> 인증번호 받기
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: 인증번호 입력 */}
      {step === 'code' && (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start gap-3 rounded-2xl bg-surface p-4">
            <Smartphone className="mt-0.5 shrink-0 text-primary" size={22} />
            <div className="text-sm text-ink">
              <p>
                <b>{phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')}</b> 로 인증번호를 발송했습니다.
              </p>
              <p className="mt-1 text-xs text-muted">3분 이내에 입력해 주세요.</p>
            </div>
          </div>

          {/* 데모용 인증번호 노출 (실제 서비스에서는 SMS로만 전달) */}
          {sentCode && (
            <div className="mt-3 rounded-xl border border-dashed border-warn/40 bg-warn/5 px-3 py-2 text-center text-sm text-amber-700">
              데모 인증번호: <b className="font-mono text-base tracking-widest">{sentCode}</b>
            </div>
          )}

          <label className="mt-4 text-xs font-semibold text-ink">인증번호 6자리</label>
          <div className="mt-1 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => { setInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
              inputMode="numeric"
              autoFocus
              placeholder="······"
              className="min-h-[52px] flex-1 rounded-xl border border-slate-200 px-3 text-center font-mono text-2xl tracking-[0.4em] focus:border-primary focus:outline-none"
            />
            {expiresAt && (
              <div className="shrink-0">
                <Timer expiresAt={expiresAt} onExpire={() => setError('인증 시간이 만료되었습니다.')} />
              </div>
            )}
          </div>

          {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}

          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-3 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-primary disabled:opacity-50"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : null} 인증번호 재발송
          </button>

          <div className="mt-auto pt-4">
            <Button
              variant="primary"
              className="w-full"
              disabled={input.length < 6}
              loading={verifying}
              onClick={handleConfirm}
            >
              <ShieldCheck size={18} /> 인증 완료
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
