// 응급 핵심정보 칩 (혈액형/알러지/만성질환)
export default function VitalChip({ icon: Icon, label, value, tone = 'primary' }) {
  const TONES = {
    primary: 'border-primary/20 bg-primary/5 text-primary',
    danger: 'border-danger/20 bg-danger/5 text-danger',
    warn: 'border-warn/30 bg-warn/5 text-amber-700',
    teal: 'border-teal/20 bg-teal/5 text-teal',
  }
  return (
    <div className={`rounded-2xl border p-3 ${TONES[tone]}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium opacity-80">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
    </div>
  )
}
