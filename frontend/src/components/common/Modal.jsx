import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, hideClose = false }) {
  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-frame animate-scale-in">
        {(title || !hideClose) && (
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-ink">{title}</h3>
            {!hideClose && (
              <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-surface">
                <X size={20} />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
