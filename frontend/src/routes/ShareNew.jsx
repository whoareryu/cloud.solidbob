import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import ShareItemPicker from '../components/share/ShareItemPicker'
import { useRecordsStore } from '../stores/useRecordsStore'
import { useShareStore } from '../stores/useShareStore'

export default function ShareNew() {
  const navigate = useNavigate()
  const { records, fetchRecords } = useRecordsStore()
  const { createConsent, creating } = useShareStore()

  const [recipientType, setRecipientType] = useState('doctor')
  const [selected, setSelected] = useState([])
  const [method, setMethod] = useState('sd_jwt')

  useEffect(() => {
    if (records.length === 0) fetchRecords()
  }, [records.length, fetchRecords])

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const handleCreate = async () => {
    const consent = await createConsent({
      recipientType,
      items: selected,
      method,
      ttlSeconds: 300, // 5분
    })
    navigate(`/share/${consent.share_id}/qr`)
  }

  return (
    <>
      <AppBar title="데이터 공유" back />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-28 pt-3">
        <p className="mb-4 text-sm text-muted">
          공유할 항목과 수신자를 선택하면 5분간 유효한 1회용 QR이 생성됩니다.
        </p>
        <ShareItemPicker
          records={records}
          recipientType={recipientType}
          setRecipientType={setRecipientType}
          selected={selected}
          toggle={toggle}
          method={method}
          setMethod={setMethod}
        />
      </main>
      {/* 하단 고정 액션 */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleCreate}
          loading={creating}
          disabled={selected.length === 0}
        >
          <QrCode size={18} /> 1회용 QR 만들기 ({selected.length})
        </Button>
      </div>
    </>
  )
}
