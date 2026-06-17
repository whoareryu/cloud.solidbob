import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Stethoscope, Siren, RotateCcw, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'
import { resetDb } from '../../mocks/api'

const ROLES = [
  { key: 'patient', label: '환자', icon: User, path: '/' },
  { key: 'clinic', label: '의료진', icon: Stethoscope, path: '/clinic' },
  { key: 'er', label: '응급실', icon: Siren, path: '/er' },
]

// 데모 역할 스위처 + 리셋. 항상 노출. fluid=true 면 가로 폭을 꽉 채워 균등 분배(사이드바용).
export default function RoleSwitcher({ fluid = false }) {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.role)
  const setRole = useAuthStore((s) => s.setRole)
  const [resetting, setResetting] = useState(false)

  const switchRole = (r) => {
    setRole(r.key)
    navigate(r.path)
  }

  const handleReset = async () => {
    setResetting(true)
    await resetDb()
    setResetting(false)
    // 시드 상태로 재시작
    window.location.reload()
  }

  return (
    <div
      className={`flex items-center gap-1 rounded-full bg-ink/90 p-1 text-white shadow-frame backdrop-blur ${
        fluid ? 'w-full' : ''
      }`}
    >
      {ROLES.map((r) => {
        const Icon = r.icon
        const active = role === r.key
        return (
          <button
            key={r.key}
            onClick={() => switchRole(r)}
            className={`flex items-center justify-center gap-1 whitespace-nowrap rounded-full py-1.5 text-xs font-semibold transition ${
              fluid ? 'min-w-0 flex-1 px-1.5' : 'px-2.5'
            } ${active ? 'bg-white text-ink' : 'text-white/70 hover:text-white'}`}
          >
            <Icon size={14} className="shrink-0" />
            {r.label}
          </button>
        )
      })}
      <button
        onClick={handleReset}
        aria-label="데모 리셋"
        className="ml-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
      >
        {resetting ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      </button>
    </div>
  )
}
