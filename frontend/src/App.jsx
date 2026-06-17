import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import RoleSwitcher from './components/common/RoleSwitcher'
import TabBar from './components/common/TabBar'
import Sidebar from './components/common/Sidebar'
import StaffCertAuth from './components/auth/StaffCertAuth'
import { useAuthStore } from './stores/useAuthStore'
import { useStaffStore } from './stores/useStaffStore'

import Login from './routes/Login'
import Home from './routes/Home'
import Connect from './routes/Connect'
import RecordDetail from './routes/RecordDetail'
import ShareNew from './routes/ShareNew'
import ShareQrPage from './routes/ShareQrPage'
import ShareHistory from './routes/ShareHistory'
import Logs from './routes/Logs'
import EmergencyInfo from './routes/EmergencyInfo'
import Clinic from './routes/Clinic'
import Er from './routes/Er'

// 데모 상단 바: 역할 스위처 + 리셋 (모바일 전용 — 데스크톱은 Sidebar 사용)
function DemoBar() {
  return (
    <div className="flex shrink-0 items-center justify-between bg-ink px-3 py-2 lg:hidden">
      <span className="text-[11px] font-bold tracking-widest text-white/50">VITALINK · DEMO</span>
      <RoleSwitcher />
    </div>
  )
}

// 로그인 가드 (환자 화면 전용)
function RequireAuth({ children }) {
  const loggedIn = useAuthStore((s) => s.loggedIn)
  const location = useLocation()
  if (!loggedIn) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

// 기관 인증서 게이트 (의료진/응급실 단말). 미인증 시 인증서 로그인 화면.
function StaffGate({ role, children }) {
  const authed = useStaffStore((s) => s.authed[role])
  if (!authed) return <StaffCertAuth role={role} />
  return children
}

// 환자 셸: 페이지 + 하단 탭바
function PatientShell() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Outlet />
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center sm:p-6 lg:items-stretch lg:p-0 lg:bg-surface">
      {/* 데스크톱(>=lg): 좌측 사이드바 (모바일에서는 숨김) */}
      <Sidebar />
      {/* 모바일: 폰 프레임 / 데스크톱: 전체폭 웹 레이아웃 */}
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-surface sm:h-[880px] sm:max-h-[94vh] sm:rounded-[2.5rem] sm:border-[10px] sm:border-ink sm:shadow-frame lg:h-screen lg:max-h-none lg:max-w-none lg:flex-1 lg:rounded-none lg:border-0 lg:shadow-none">
        <DemoBar />
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* 환자 화면 */}
            <Route
              element={
                <RequireAuth>
                  <PatientShell />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/records/:id" element={<RecordDetail />} />
              <Route path="/share/new" element={<ShareNew />} />
              <Route path="/share/:id/qr" element={<ShareQrPage />} />
              <Route path="/share/history" element={<ShareHistory />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/emergency-info" element={<EmergencyInfo />} />
            </Route>

            {/* 의료진 / 응급실 단말 — 기관 인증서 로그인 필요 */}
            <Route
              path="/clinic"
              element={
                <StaffGate role="clinic">
                  <Clinic />
                </StaffGate>
              }
            />
            <Route
              path="/er"
              element={
                <StaffGate role="er">
                  <Er />
                </StaffGate>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
