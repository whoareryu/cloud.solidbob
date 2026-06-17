import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

// 만료까지 카운트다운. expiresAt(ISO) 기준. 만료 시 onExpire 호출.
export default function Timer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
  )

  useEffect(() => {
    const id = setInterval(() => {
      const sec = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setRemaining(sec)
      if (sec <= 0) {
        clearInterval(id)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const tone = remaining <= 30 ? 'text-danger' : 'text-ink'

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-lg font-bold ${tone}`}>
      <Clock size={18} />
      {mm}:{ss}
    </span>
  )
}
