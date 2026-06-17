import { ChevronLeft, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// 상단 앱바. 참조 이미지의 중앙 로고 + 좌측 back 패턴.
export default function AppBar({ title, back = false, right = null }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white/90 px-3 backdrop-blur">
      <div className="flex w-16 items-center">
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1.5 text-ink hover:bg-surface"
            aria-label="뒤로"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5 font-bold text-ink">
        {title ? (
          <span className="text-[15px]">{title}</span>
        ) : (
          <>
            <Activity size={18} className="text-primary" />
            <span className="bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
              VitaLink
            </span>
          </>
        )}
      </div>
      <div className="flex w-16 items-center justify-end">{right}</div>
    </header>
  )
}
