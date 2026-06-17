import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Building2,
  Share2,
  HeartPulse,
  ScrollText,
  Stethoscope,
  Siren,
  Activity,
} from 'lucide-react'
import RoleSwitcher from './RoleSwitcher'
import { useAuthStore } from '../../stores/useAuthStore'
import { useLogStore } from '../../stores/useLogStore'

// 역할별 네비게이션 (데스크톱 웹 레이아웃 전용)
const NAV = {
  patient: [
    { to: '/', label: '홈', icon: Home, end: true },
    { to: '/connect', label: '기관 연동', icon: Building2 },
    { to: '/share/history', label: '데이터 공유', icon: Share2 },
    { to: '/emergency-info', label: '응급 의료정보', icon: HeartPulse },
    { to: '/logs', label: '접근 로그', icon: ScrollText, badgeKey: 'emergency' },
  ],
  clinic: [{ to: '/clinic', label: '의료진 콘솔', icon: Stethoscope }],
  er: [{ to: '/er', label: '응급실 콘솔', icon: Siren }],
}

const ROLE_LABEL = { patient: '환자', clinic: '의료진', er: '응급실' }

// 데스크톱(>=lg)에서만 노출되는 좌측 사이드바
export default function Sidebar() {
  const role = useAuthStore((s) => s.role)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const emergencyCount = useLogStore((s) => s.emergencyCount())

  // 로그인 화면에서는 숨김
  if (location.pathname === '/login') return null

  const items = NAV[role] ?? NAV.patient

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal text-white">
          <Activity size={20} />
        </div>
        <div>
          <p className="text-lg font-extrabold leading-none text-ink">VitaLink</p>
          <p className="text-[11px] text-muted">의료데이터 통합 지갑</p>
        </div>
      </div>

      {/* 데모 역할 전환 */}
      <div className="px-4 pb-4">
        <p className="mb-1.5 text-[11px] font-bold tracking-widest text-muted">DEMO 역할</p>
        <RoleSwitcher fluid />
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => {
          const Icon = it.icon
          const badge = it.badgeKey === 'emergency' ? emergencyCount : 0
          return (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-surface'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{it.label}</span>
              {badge > 0 && (
                <span className="rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* 하단: 현재 역할/사용자 */}
      <div className="border-t border-slate-100 px-5 py-4 text-xs text-muted">
        <p className="font-semibold text-ink">{ROLE_LABEL[role]} 모드</p>
        {role === 'patient' && user && <p className="mt-0.5 truncate">{user.name} · {user.did}</p>}
        {role !== 'patient' && <p className="mt-0.5">PC 단말 (브라우저)</p>}
      </div>
    </aside>
  )
}
