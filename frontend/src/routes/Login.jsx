import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ShieldCheck, Fingerprint, Smartphone, CheckCircle2 } from 'lucide-react'
import Button from '../components/common/Button'
import IdentityVerification from '../components/auth/IdentityVerification'
import { useAuthStore } from '../stores/useAuthStore'

// DID 인증 로그인 (환자). intro → 휴대폰 본인인증 → DID 발급 → 홈
export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const loggingIn = useAuthStore((s) => s.loggingIn)
  const loggedIn = useAuthStore((s) => s.loggedIn)

  const [mode, setMode] = useState('intro') // intro | verify | success
  const [verifiedProfile, setVerifiedProfile] = useState(null)

  useEffect(() => {
    if (loggedIn) navigate('/', { replace: true })
  }, [loggedIn, navigate])

  // 본인인증 통과 → 완료 화면 잠깐 보여주고 로그인
  const handleVerified = async (res) => {
    setVerifiedProfile(res.profile)
    setMode('success')
    await new Promise((r) => setTimeout(r, 1100))
    await login({ skipMobileAuth: true })
    navigate('/', { replace: true })
  }

  // 데모 반복 시연용 빠른 로그인 (본인인증 생략)
  const handleQuick = async () => {
    const ok = await login()
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-col overflow-y-auto no-scrollbar bg-white px-6 pb-8 pt-10 lg:max-w-md">
      {mode === 'intro' && (
        <>
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-teal text-white shadow-card">
              <Activity size={40} />
            </div>
            <h1 className="mt-6 text-2xl font-extrabold text-ink">VitaLink</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              흩어진 내 의료데이터를 하나로.
              <br />
              휴대폰 본인인증으로 안전하게 시작하세요.
            </p>

            <div className="mt-8 w-full space-y-2 text-left">
              {[
                { icon: ShieldCheck, t: '블록체인 무결성', d: '진료기록 위변조 방지' },
                { icon: Fingerprint, t: 'DID 자기주권 신원', d: '내 데이터는 내가 통제' },
              ].map((f) => (
                <div key={f.t} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary">
                    <f.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{f.t}</p>
                    <p className="text-xs text-muted">{f.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={() => setMode('verify')}>
            <Smartphone size={18} /> 휴대폰 본인인증으로 시작
          </Button>
          <button
            onClick={handleQuick}
            disabled={loggingIn}
            className="mt-3 text-center text-xs font-semibold text-muted underline-offset-2 hover:underline disabled:opacity-50"
          >
            {loggingIn ? '로그인 중…' : '데모 빠른 로그인 (본인인증 생략)'}
          </button>
        </>
      )}

      {mode === 'verify' && (
        <IdentityVerification onVerified={handleVerified} onCancel={() => setMode('intro')} />
      )}

      {mode === 'success' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-ink">본인인증 완료</h1>
          <p className="mt-2 text-sm text-muted">
            {verifiedProfile?.name}님, DID를 발급하고 있어요…
          </p>
          <p className="mt-3 font-mono text-xs text-primary">did:web:vitalink.io:user:jiwon</p>
        </div>
      )}
    </div>
  )
}
