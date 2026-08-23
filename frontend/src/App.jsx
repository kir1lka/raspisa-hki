import { useEffect, useRef, useState } from 'react'
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
const PULL_TO_REFRESH_THRESHOLD = 110

// В установленном PWA браузерной кнопки обновления нет. Если пользователь
// тянет страницу вниз от самой верхней границы, отпускаем жест и перезагружаем
// приложение после прохождения порога. Горизонтальные свайпы не перехватываем.
function useStandalonePullToRefresh() {
  const gestureRef = useRef(null)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    const isTouchDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
    if (!isStandalone || !isTouchDevice) return undefined

    const reset = () => {
      gestureRef.current = null
    }

    const handleTouchStart = (event) => {
      if (event.touches.length !== 1 || window.scrollY > 0) {
        reset()
        return
      }

      const touch = event.touches[0]
      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        distance: 0,
      }
    }

    const handleTouchMove = (event) => {
      const gesture = gestureRef.current
      if (!gesture || event.touches.length !== 1) return

      const touch = event.touches[0]
      const deltaX = touch.clientX - gesture.startX
      const deltaY = touch.clientY - gesture.startY

      if (Math.abs(deltaX) > Math.abs(deltaY) + 8 || deltaY <= 0) {
        reset()
        return
      }

      gesture.distance = deltaY
    }

    const handleTouchEnd = () => {
      const shouldRefresh = gestureRef.current?.distance >= PULL_TO_REFRESH_THRESHOLD
      reset()
      if (shouldRefresh) window.location.reload()
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('touchcancel', reset, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', reset)
    }
  }, [])
}

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
  useStandalonePullToRefresh()
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
