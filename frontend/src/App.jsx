import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import SchedulePage from './pages/SchedulePage/SchedulePage'
import MainTabs from './pages/MainTabs/MainTabs'
import AuthPage from './pages/AuthPage/AuthPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import WelcomeModal from './components/WelcomeModal/WelcomeModal'
import Particles from './components/Particles/Particles'
import WarmBackdrop from './components/WarmBackdrop/WarmBackdrop'
import { getUser } from './auth'
import { getDefaultSelection, defaultSelectionPath, getLastSelection } from './defaultSelection'

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
  // Сначала выбор «открывать при входе», иначе — последняя открытая группа
  // или преподаватель, чтобы возврат на вкладку не сбрасывал поиск.
  const path = defaultSelectionPath(getDefaultSelection() || getLastSelection())
  return path ? <Navigate to={path} replace /> : <MainTabs />
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
    <Particles />
    <WarmBackdrop />

    <Routes>
      {/* Без GuestOnly: иначе вкладка «Расписание» в нижнем меню у вошедшего
          пользователя перекидывала на админ-панель вместо расписания. */}
      <Route path="/" element={<Home />} />
      <Route path="/group/:number" element={<MainTabs />} />
      <Route path="/teacher/:teacherId" element={<MainTabs />} />
      <Route path="/studios" element={<MainTabs />} />
      <Route path="/events" element={<MainTabs />} />
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
