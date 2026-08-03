import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import AppHeader from '../../components/AppHeader/AppHeader'
import TabBar from '../../components/TabBar/TabBar'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import ScrollTopButton from '../../components/ScrollTopButton/ScrollTopButton'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import SchedulePage from '../SchedulePage/SchedulePage'
import StudiosPage from '../StudiosPage/StudiosPage'
import EventsPage from '../EventsPage/EventsPage'
import { useUiSettings } from '../../useUiSettings'
import { getLastSelection, defaultSelectionPath } from '../../defaultSelection'
import { fetchGroups, fetchTeachers } from '../../api'
import { loadCached } from '../../cache'

const TITLES = ['Расписание', 'Студии', 'События']
const KEYS = ['schedule', 'studios', 'events']

const tabForPath = (p) => (p.startsWith('/studios') ? 1 : p.startsWith('/events') ? 2 : 0)

/**
 * Общий каркас трёх публичных вкладок.
 *
 * Страницы держатся в DOM одновременно и лежат в Swiper, поэтому переключение —
 * настоящее перелистывание пальцем, без перезагрузки и повторных запросов.
 * Шапка, подвал, нижняя панель и настройки живут здесь, иначе их было бы по три.
 *
 * autoHeight подгоняет высоту под активный слайд. Прошлая попытка на Embla
 * схлопывала неактивные слайды вручную, и от этого ломались его замеры —
 * здесь этим занимается сама библиотека.
 */
export default function MainTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme, zoom, setZoom } = useUiSettings()

  const index = tabForPath(location.pathname)
  const swiperRef = useRef(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    loadCached('groups', fetchGroups).then(setGroups).catch(() => setGroups([]))
    loadCached('teachers', fetchTeachers).then(setTeachers).catch(() => setTeachers([]))
  }, [])

  // Адрес → слайд: клик по нижней панели или переход по ссылке
  useEffect(() => {
    const swiper = swiperRef.current
    if (swiper && swiper.activeIndex !== index) swiper.slideTo(index)
  }, [index])

  // Адрес меняем только после жеста пальцем. При монтировании Swiper сам
  // сообщает о смене слайда, и без этой проверки клик по вкладке тут же
  // откатывался обратно на расписание.
  const swiped = useRef(false)

  const handleTransitionEnd = (swiper) => {
    if (!swiped.current) return
    swiped.current = false
    const i = swiper.activeIndex
    if (i === tabForPath(window.location.pathname)) return
    if (i === 1) navigate('/studios')
    else if (i === 2) navigate('/events')
    else navigate(defaultSelectionPath(getLastSelection()) || '/')
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-[100dvh] flex-col [--ui-base:1]">
      <AppHeader
        title={TITLES[index]}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex flex-1 flex-col">
        <Swiper
          autoHeight
          initialSlide={index}
          speed={280}
          resistanceRatio={0.6}
          threshold={8}
          onSwiper={(s) => { swiperRef.current = s }}
          onTouchStart={() => { swiped.current = true }}
          onSlideChangeTransitionEnd={handleTransitionEnd}
        >
          <SwiperSlide>
            <SchedulePage embedded />
          </SwiperSlide>
          <SwiperSlide>
            <StudiosPage embedded />
          </SwiperSlide>
          <SwiperSlide>
            <EventsPage embedded />
          </SwiperSlide>
        </Swiper>
      </main>

      <SiteFooter />
      <ScrollTopButton />
      <TabBar active={KEYS[index]} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        zoom={zoom}
        onZoomChange={setZoom}
        groups={groups}
        teachers={teachers}
        showTheme={false}
      />
    </div>
  )
}
