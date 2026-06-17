import { create } from 'zustand'
import * as api from '../mocks/api'

// 접근 로그 스토어. 모든 열람/공유/응급 접근은 api 내부에서 자동 기록되며,
// 명시적 로그가 필요할 때 addLog 를 직접 호출할 수도 있다.
export const useLogStore = create((set, get) => ({
  logs: [],
  loading: false,

  fetchLogs: async () => {
    set({ loading: true })
    const logs = await api.listLogs()
    set({ logs, loading: false })
  },

  addLog: async (entry) => {
    await api.addLog(entry)
    await get().fetchLogs()
  },

  // patient 홈 "응급 열람 발생" 배지용
  emergencyCount: () => get().logs.filter((l) => l.access_type === 'emergency').length,
}))
