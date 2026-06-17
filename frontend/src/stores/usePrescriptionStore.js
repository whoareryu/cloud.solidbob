import { create } from 'zustand'
import * as api from '../mocks/api'

// 처방/약물충돌 스토어
export const usePrescriptionStore = create((set) => ({
  drugs: [],
  prescriptions: [],
  checking: false,

  fetchDrugs: async () => {
    const drugs = await api.getDrugs()
    set({ drugs })
    return drugs
  },

  checkInteraction: async (newDrugCode) => {
    set({ checking: true })
    const hits = await api.checkInteraction(newDrugCode)
    set({ checking: false })
    return hits
  },
}))
