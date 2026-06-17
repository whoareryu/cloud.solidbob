// 상태 배지. tone 별 색상.
const TONES = {
  success: 'bg-success/10 text-success',
  primary: 'bg-primary/10 text-primary',
  teal: 'bg-teal/10 text-teal',
  warn: 'bg-warn/10 text-amber-700',
  danger: 'bg-danger/10 text-danger',
  muted: 'bg-slate-100 text-muted',
}

export default function Badge({ tone = 'muted', className = '', children }) {
  return <span className={`chip ${TONES[tone] ?? TONES.muted} ${className}`}>{children}</span>
}
