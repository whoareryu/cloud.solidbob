import { X } from 'lucide-react'

// 하단에서 올라오는 바텀시트
export default function Sheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full rounded-t-3xl bg-white p-5 pb-6 shadow-frame animate-fade-in">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />
        {title && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{title}</h3>
            <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-surface">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
