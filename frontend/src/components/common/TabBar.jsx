import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Share2, HeartPulse, ScrollText, QrCode } from 'lucide-react'
import { useLogStore } from '../../stores/useLogStore'

// 하단 탭바 (patient). 참조 이미지(Curity)의 중앙 QR FAB 패턴.
const TABS = [
  { to: '/', label: '홈', icon: Home, end: true },
  { to: '/share/history', label: '공유', icon: Share2 },
  { to: '/emergency-info', label: '응급정보', icon: HeartPulse },
  { to: '/logs', label: '로그', icon: ScrollText },
]

function Tab({ to, label, icon: Icon, end, badge }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition ${
          isActive ? 'text-primary' : 'text-muted'
        }`
      }
    >
      <Icon size={22} />
      <span>{label}</span>
      {badge > 0 && (
        <span className="absolute right-1/2 top-1 translate-x-3 rounded-full bg-danger px-1.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function TabBar() {
  const navigate = useNavigate()
  const emergencyCount = useLogStore((s) => s.emergencyCount())

  return (
    <nav className="relative z-30 shrink-0 border-t border-slate-100 bg-white lg:hidden">
      {/* 중앙 QR 액션 버튼 (일회성 공유 QR 생성) */}
      <button
        onClick={() => navigate('/share/new')}
        aria-label="공유 QR 만들기"
        className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/40 transition active:scale-95"
      >
        <QrCode size={26} />
      </button>
      <div className="flex items-stretch px-2 pb-[max(env(safe-area-inset-bottom),0px)]">
        <Tab {...TABS[0]} />
        <Tab {...TABS[1]} />
        <div className="w-14 shrink-0" aria-hidden />
        <Tab {...TABS[2]} badge={emergencyCount} />
        <Tab {...TABS[3]} />
      </div>
    </nav>
  )
}
