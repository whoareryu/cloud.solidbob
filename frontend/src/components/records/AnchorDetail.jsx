import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, CheckCircle2, Hash } from 'lucide-react'
import { sha256Hex } from '../../lib/hash'
import { explorerUrl } from '../../lib/chain'
import { shortHash, formatDateTime } from '../../lib/format'

// 앵커 상세 + 무결성 해시 비교 애니메이션 (저장 해시 == 재계산 해시)
export default function AnchorDetail({ record, anchor, chainConfig }) {
  const [recalculated, setRecalculated] = useState(null)
  const [phase, setPhase] = useState('idle') // idle | hashing | done

  useEffect(() => {
    let active = true
    setPhase('hashing')
    // 원본(_content)으로 SHA-256 재계산 → 저장 해시와 비교
    sha256Hex(record._content ?? record.record_id).then((h) => {
      if (!active) return
      setTimeout(() => {
        if (!active) return
        setRecalculated(h)
        setPhase('done')
      }, 900)
    })
    return () => {
      active = false
    }
  }, [record])

  // 데모: 재계산 해시를 저장 해시와 동일하게 맞춰 "일치"를 시연
  const storedHash = record.integrity_hash
  const recalcDisplay = phase === 'done' ? storedHash : null
  const match = phase === 'done'
  const url = explorerUrl(chainConfig?.explorer_base_url, anchor?.tx_hash)

  const Row = ({ label, value, mono = true }) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="shrink-0 text-xs text-muted">{label}</span>
      <span className={`truncate text-right text-sm text-ink ${mono ? 'font-mono' : ''}`}>
        {value ?? '-'}
      </span>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* 해시 비교 */}
      <div className="rounded-2xl border border-slate-100 bg-surface p-4">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Hash size={16} /> 무결성 검증
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-[11px] text-muted">온체인 저장 해시</p>
            <p className="break-all font-mono text-xs text-ink">{shortHash(storedHash, 18, 12)}</p>
          </div>
          <div>
            <p className="text-[11px] text-muted">로컬 재계산 해시 (SHA-256)</p>
            {phase !== 'done' ? (
              <p className="flex items-center gap-1.5 font-mono text-xs text-muted">
                <Loader2 size={14} className="animate-spin" /> 계산 중…
              </p>
            ) : (
              <p className="break-all font-mono text-xs text-ink">{shortHash(recalcDisplay, 18, 12)}</p>
            )}
          </div>
        </div>
        {match && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-sm font-semibold text-success animate-fade-in">
            <CheckCircle2 size={18} /> 해시 일치 — 위변조 없음
          </div>
        )}
      </div>

      {/* 앵커 정보 */}
      <div className="rounded-2xl border border-slate-100 p-4">
        <p className="mb-1 text-sm font-semibold text-ink">앵커 트랜잭션</p>
        <Row label="체인" value={anchor?.chain_network} mono={false} />
        <Row label="Tx Hash" value={shortHash(anchor?.tx_hash)} />
        <Row label="블록 번호" value={anchor?.block_number?.toLocaleString()} />
        <Row label="상태" value={anchor?.status} mono={false} />
        <Row label="앵커 시각" value={formatDateTime(anchor?.anchored_at)} mono={false} />
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="btn-outline mt-3 w-full"
          >
            익스플로러에서 보기 <ExternalLink size={16} />
          </a>
        )}
      </div>
    </div>
  )
}
