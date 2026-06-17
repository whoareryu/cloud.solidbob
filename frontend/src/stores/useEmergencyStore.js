import { create } from 'zustand'
import * as api from '../mocks/api'

// 응급 의료정보 + 응급 접근 권한 스토어
export const useEmergencyStore = create((set, get) => ({
  info: null,
  user: null,
  grant: null,
  meds: [],
  loading: false,
  requesting: false,

  fetchInfo: async () => {
    set({ loading: true })
    const [info, user] = await Promise.all([api.getEmergencyInfo(), api.getUser()])
    set({ info, user, loading: false })
  },

  updateInfo: async (patch) => {
    const info = await api.updateEmergencyInfo(patch)
    set({ info })
    return info
  },

  currentMedications: async () => {
    const meds = await api.currentMedications()
    set({ meds })
    return meds
  },

  requestEmergencyAccess: async () => {
    set({ requesting: true })
    const grant = await api.requestEmergencyAccess()
    const [info, user, meds] = await Promise.all([
      api.getEmergencyInfo(),
      api.getUser(),
      api.currentMedications(),
    ])
    set({ grant, info, user, meds, requesting: false })
    return grant
  },

  clearGrant: () => set({ grant: null }),
}))
