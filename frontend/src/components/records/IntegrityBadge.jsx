import { ShieldCheck, ShieldAlert } from 'lucide-react'

// 블록체인 무결성 검증 배지 (방패+체크). verified=false 면 미검증.
export default function IntegrityBadge({ verified = true, size = 'sm', onClick }) {
  const Icon = verified ? ShieldCheck : ShieldAlert
  const cls = verified ? 'bg-success/10 text-success' : 'bg-slate-100 text-muted'
  const pad = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'
  const Comp = onClick ? 'button' : 'span'
  return (
    <Comp
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${cls} ${pad} ${
        onClick ? 'transition active:scale-95' : ''
      }`}
    >
      <Icon size={size === 'lg' ? 18 : 14} />
      {verified ? '블록체인 검증됨' : '미검증'}
    </Comp>
  )
}
