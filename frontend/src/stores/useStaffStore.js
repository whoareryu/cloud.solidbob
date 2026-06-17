import { create } from 'zustand'

// 의료진/응급실 단말의 기관 인증서 세션. 역할별로 인증 여부를 보관한다.
// (데모 리셋 시 페이지 reload 로 초기화됨)
export const useStaffStore = create((set) => ({
  authed: { clinic: false, er: false },
  institution: { clinic: null, er: null },

  authenticate: (role, institution) =>
    set((s) => ({
      authed: { ...s.authed, [role]: true },
      institution: { ...s.institution, [role]: institution },
    })),

  signOut: (role) =>
    set((s) => ({
      authed: { ...s.authed, [role]: false },
      institution: { ...s.institution, [role]: null },
    })),
}))
