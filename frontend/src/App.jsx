import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SchedulePage from './pages/SchedulePage/SchedulePage'
import AuthPage from './pages/AuthPage/AuthPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import WelcomeModal from './components/WelcomeModal/WelcomeModal'
import { getUser } from './auth'
import { getDefaultSelection, defaultSelectionPath } from './defaultSelection'

const WELCOME_KEY = 'welcome-seen-v1'

function RequireAuth({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }) {
  return getUser() ? <Navigate to="/dashboard" replace /> : children
}

// Стартовый экран: если задан выбор по умолчанию — сразу открываем его расписание,
// иначе обычный поиск.
function Home() {
  const path = defaultSelectionPath(getDefaultSelection())
  return path ? <Navigate to={path} replace /> : <SchedulePage />
}

export default function App() {
  const location = useLocation()
  const isPublic = !location.pathname.startsWith('/login') && !location.pathname.startsWith('/dashboard')
  const [welcomeOpen, setWelcomeOpen] = useState(() => !localStorage.getItem(WELCOME_KEY))

  function closeWelcome() {
    localStorage.setItem(WELCOME_KEY, '1')
    setWelcomeOpen(false)
  }

  return (
    <>
    <Routes>
      <Route path="/" element={<GuestOnly><Home /></GuestOnly>} />
      <Route path="/group/:number" element={<SchedulePage />} />
      <Route path="/teacher/:teacherId" element={<SchedulePage />} />
      <Route path="/login" element={<GuestOnly><AuthPage /></GuestOnly>} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/group/:number"
        element={
          <RequireAuth>
            <SchedulePage base="/dashboard" />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/teacher/:teacherId"
        element={
          <RequireAuth>
            <SchedulePage base="/dashboard" />
          </RequireAuth>
        }
      />
    </Routes>

    {isPublic && <WelcomeModal open={welcomeOpen} onClose={closeWelcome} />}
    </>
  )
}
