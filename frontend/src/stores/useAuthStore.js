import { create } from 'zustand'
import * as api from '../mocks/api'

// 인증/역할 스토어. role: 'patient' | 'clinic' | 'er'
export const useAuthStore = create((set) => ({
  user: null,
  did: null,
  role: 'patient',
  loggedIn: false,
  loggingIn: false,

  login: async (opts) => {
    set({ loggingIn: true })
    try {
      const { user, did, role } = await api.login(opts)
      set({ user, did, role, loggedIn: true, loggingIn: false })
      return true
    } catch (e) {
      set({ loggingIn: false })
      return false
    }
  },

  logout: () => set({ user: null, did: null, loggedIn: false, role: 'patient' }),

  setRole: (role) => set({ role }),
}))
