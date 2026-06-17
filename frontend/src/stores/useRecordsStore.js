import { create } from 'zustand'
import * as api from '../mocks/api'

// 진료기록 + 앵커 + 기관 연동 스토어
export const useRecordsStore = create((set, get) => ({
  records: [],
  institutions: [], // 미연동 기관
  allInstitutions: [], // 전체 기관 (이름 매핑용)
  loading: false,
  connecting: null, // 연동 중인 institution_id

  fetchRecords: async () => {
    set({ loading: true })
    const [records, allInstitutions] = await Promise.all([
      api.listRecords(),
      api.listInstitutions(),
    ])
    set({ records, allInstitutions, loading: false })
  },

  fetchUnconnected: async () => {
    const institutions = await api.listUnconnectedInstitutions()
    set({ institutions })
  },

  connectInstitution: async (institutionId) => {
    set({ connecting: institutionId })
    const collected = await api.connectInstitution(institutionId)
    await get().fetchRecords()
    await get().fetchUnconnected()
    set({ connecting: null })
    return collected
  },

  getAnchor: (recordId) => api.getAnchor(recordId),
  getChainConfig: (network) => api.getChainConfig(network),
  getRecord: (recordId) => api.getRecord(recordId),
}))
