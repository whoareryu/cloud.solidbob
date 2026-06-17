import { useEffect, useMemo, useState } from 'react'
import { Siren, Loader2, PlusCircle, Clock, LogOut } from 'lucide-react'
import AppBar from '../components/common/AppBar'
import Button from '../components/common/Button'
import Sheet from '../components/common/Sheet'
import EmergencySummaryCard from '../components/emergency/EmergencySummaryCard'
import InteractionAlert from '../components/emergency/InteractionAlert'
import Timer from '../components/common/Timer'
import { useEmergencyStore } from '../stores/useEmergencyStore'
import { usePrescriptionStore } from '../stores/usePrescriptionStore'
import { useLogStore } from '../stores/useLogStore'
import { useStaffStore } from '../stores/useStaffStore'
import { summarizeEmergency } from '../lib/ai'
import * as api from '../mocks/api'

// 응급실 단말: 응급접근 → AI 요약 + 복용약 → 신규 처방 충돌검사
export default function Er() {
  const { grant, info, user, meds, requesting, requestEmergencyAccess, clearGrant } =
    useEmergencyStore()
  const { drugs, fetchDrugs, checkInteraction, checking } = usePrescriptionStore()
  const fetchLogs = useLogStore((s) => s.fetchLogs)
  const signOut = useStaffStore((s) => s.signOut)

  const [interactions, setInteractions] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [hits, setHits] = useState([])

  useEffect(() => {
    fetchDrugs()
    api.getDrugInteractions().then(setInteractions)
    fetchLogs()
  }, [fetchDrugs, fetchLogs])

  const ai = useMemo(() => {
    if (!info) return { summary: '', highlights: {}, warnings: [] }
    return summarizeEmergency({ user, emergencyInfo: info, currentMeds: meds, interactions })
  }, [user, info, meds, interactions])

  const handleAccess = async () => {
    await requestEmergencyAccess()
  }

  const handlePickDrug = async (drug) => {
    setSelectedDrug(drug)
    setSheetOpen(false)
    const found = await checkInteraction(drug.drug_code)
    setHits(found)
    setAlertOpen(true)
  }

  // 현재 복용약은 신규 처방 후보에서 제외
  const candidateDrugs = drugs.filter((d) => !meds.some((m) => m.drug_code === d.drug_code))

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <AppBar
        title="응급실 단말"
        right={
          <button
            onClick={() => signOut('er')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-surface"
            aria-label="인증 해제"
          >
            <LogOut size={18} />
          </button>
        }
      />
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-8 lg:mx-auto lg:w-full lg:max-w-3xl pb-8 pt-4">
        {!grant ? (
          <div className="flex flex-col items-center rounded-2xl bg-gradient-to-br from-danger to-[#991B1B] p-6 text-center text-white shadow-card">
            <Siren size={44} />
            <h1 className="mt-3 text-lg font-extrabold">응급 접근</h1>
            <p className="mt-1 text-sm text-white/85">
              환자 DID/QR로 응급 의료정보에 임시 접근합니다. 모든 접근은 환자 로그에 기록됩니다.
            </p>
            <Button
              variant="ghost"
              className="mt-5 w-full bg-white text-danger hover:bg-white"
              onClick={handleAccess}
              loading={requesting}
            >
              {requesting ? '권한 요청 중…' : '환자 DID/QR로 응급 접근'}
            </Button>
          </div>
        ) : (
          <>
            {/* 권한 만료 타이머 */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-warn/30 bg-warn/5 px-4 py-3">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <Clock size={16} /> 임시 권한 활성
              </span>
              <Timer expiresAt={grant.expires_at} onExpire={clearGrant} />
            </div>

            <EmergencySummaryCard user={user} ai={ai} info={info} meds={meds} />

            {/* 신규 처방 */}
            <div className="mt-5">
              <Button variant="primary" className="w-full" onClick={() => setSheetOpen(true)}>
                <PlusCircle size={18} /> 신규 처방 입력
              </Button>
            </div>
          </>
        )}
      </main>

      {/* 약 선택 시트 */}
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="처방할 약물 선택">
        <div className="max-h-[50vh] space-y-2 overflow-y-auto no-scrollbar">
          {candidateDrugs.map((d) => (
            <button
              key={d.drug_code}
              onClick={() => handlePickDrug(d)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left transition active:scale-[0.99]"
            >
              <span>
                <span className="block text-sm font-semibold text-ink">{d.drug_name}</span>
                <span className="block text-xs text-muted">{d.drug_code} · {d.atc_class}</span>
              </span>
              {checking && selectedDrug?.drug_code === d.drug_code && (
                <Loader2 size={18} className="animate-spin text-primary" />
              )}
            </button>
          ))}
        </div>
      </Sheet>

      {/* 충돌 경고 */}
      <InteractionAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        newDrugName={selectedDrug?.drug_name}
        hits={hits}
      />
    </div>
  )
}
