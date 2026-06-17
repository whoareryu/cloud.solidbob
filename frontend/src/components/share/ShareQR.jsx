import { QRCodeSVG } from 'qrcode.react'

// 토큰을 담은 일회성 공유 QR. 참조 이미지(Digital ID)의 파란 카드 + QR 스타일.
export default function ShareQR({ token, dimmed = false }) {
  // QR 페이로드: clinic 단말이 스캔해 토큰을 추출
  const payload = JSON.stringify({ t: 'vitalink_share', token })
  return (
    <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F6FFF] to-[#0B3A99] p-5 text-white shadow-frame">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -right-10 top-6 h-32 w-32 rounded-full border-[16px] border-white/30" />
      </div>
      <div className="relative flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide">VITALINK SHARE</span>
        <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">1회용</span>
      </div>
      <div className="relative mx-auto mt-4 w-fit rounded-2xl bg-white p-3">
        <QRCodeSVG value={payload} size={180} level="M" />
      </div>
      <p className="relative mt-4 break-all text-center font-mono text-[10px] text-white/70">
        {token}
      </p>
      {dimmed && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/70 text-sm font-bold">
          사용 완료 / 만료됨
        </div>
      )}
    </div>
  )
}
