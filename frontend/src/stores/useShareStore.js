import { create } from 'zustand'
import * as api from '../mocks/api'

// 데이터 공유(일회성 토큰) 스토어
export const useShareStore = create((set, get) => ({
  consents: [],
  loading: false,
  creating: false,

  fetchConsents: async () => {
    set({ loading: true })
    const consents = await api.listConsents()
    set({ consents, loading: false })
  },

  createConsent: async ({ recipientType, items, method, ttlSeconds = 300 }) => {
    set({ creating: true })
    const consent = await api.issueShareToken({
      recipient_type: recipientType,
      shared_items: items,
      disclosure_method: method,
      ttl_seconds: ttlSeconds,
    })
    await get().fetchConsents()
    set({ creating: false })
    return consent
  },

  getConsent: (shareId) => api.getConsent(shareId),

  consumeToken: async (token) => {
    const result = await api.redeemShareToken(token)
    await get().fetchConsents()
    return result
  },

  consumeByCode: async (shareRef, code) => {
    const result = await api.redeemShareByCode(shareRef, code)
    await get().fetchConsents()
    return result
  },

  revoke: async (shareId) => {
    await api.revokeConsent(shareId)
    await get().fetchConsents()
  },
}))
