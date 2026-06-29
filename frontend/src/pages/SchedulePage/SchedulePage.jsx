import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CalendarSearch } from 'lucide-react'
import Logo from '../../components/Logo/Logo'
import SearchBar from '../../components/SearchBar/SearchBar'
import WeekBar from '../../components/WeekBar/WeekBar'
import Schedule from '../../components/Schedule/Schedule'
import ScheduleSkeleton from '../../components/ScheduleSkeleton/ScheduleSkeleton'
import ScrollTopButton from '../../components/ScrollTopButton/ScrollTopButton'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import CalendarModal from '../../components/CalendarModal/CalendarModal'
import StudioSheet from '../../components/StudioSheet/StudioSheet'
import { fetchGroupLessons, fetchTeacherLessons, fetchGroups, fetchTeachers, fetchHolidays, fetchStudios } from '../../api'
import { DAY_ORDER } from '../../utils'
import { mondayOf, addDays, sameDay, defaultWeekStart } from '../../dates'

export default function SchedulePage({ base = '' }) {
  const { number, teacherId } = useParams()
  const navigate = useNavigate()
  const selection = number || teacherId

  const [query, setQuery] = useState('')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])
  const [holidays, setHolidays] = useState(null)
  const [studios, setStudios] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [studioLesson, setStudioLesson] = useState(null)
  const [monday, setMonday] = useState(() => defaultWeekStart())
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('ui-zoom')) || 0.9)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-zoom', String(zoom))
    localStorage.setItem('ui-zoom', String(zoom))
  }, [zoom])

  useEffect(() => {
    fetchGroups().then(setGroups).catch(() => setGroups([]))
    fetchTeachers().then(setTeachers).catch(() => setTeachers([]))
    fetchHolidays().then(setHolidays).catch(() => setHolidays([]))
    fetchStudios().then(setStudios).catch(() => setStudios([]))
  }, [])

  useEffect(() => {
    if (number) setQuery(`${number} группа`)
  }, [number])

  useEffect(() => {
    if (teacherId && teachers.length) {
      const t = teachers.find((x) => String(x.id) === String(teacherId))
      if (t) setQuery(t.fullName)
    }
  }, [teacherId, teachers])

  useEffect(() => {
    if (!selection) {
      setLessons([])
      return
    }
    const request = number ? fetchGroupLessons(number) : fetchTeacherLessons(teacherId)
    setLoading(true)
    setError(null)
    request
      .then(setLessons)
      .catch((e) => { setError(e.message); setLessons([]) })
      .finally(() => setLoading(false))
  }, [number, teacherId, selection])

  useEffect(() => {
    setMonday((m) => (sameDay(m, defaultWeekStart()) ? m : defaultWeekStart()))
  }, [number, teacherId])

  useEffect(() => {
    if (!lessons.length) return
    const today = new Date()
    const isCurrentWeek = sameDay(monday, mondayOf(today))
    requestAnimationFrame(() => {
      if (isCurrentWeek) {
        const el = document.getElementById(`day-${DAY_ORDER[(today.getDay() + 6) % 7]}`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

  }, [lessons])

  const weekMounted = useRef(false)
  useEffect(() => {
    if (!weekMounted.current) {
      weekMounted.current = true
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [monday])

  return (
    <div className="flex min-h-[100dvh] flex-col">

      <div className="pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-[1140px] justify-center px-3 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <Logo to={base ? '/dashboard' : '/login'} />
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-[1140px] px-3 pb-3 md:px-6 md:pb-4 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            groups={groups}
            teachers={teachers}
            onSelectGroup={(n) => navigate(`${base}/group/${n}`)}
            onSelectTeacher={(id) => navigate(`${base}/teacher/${id}`)}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {selection && (
            <WeekBar
              monday={monday}
              onPrev={() => setMonday((m) => addDays(m, -7))}
              onNext={() => setMonday((m) => addDays(m, 7))}
              onOpenCalendar={() => setCalendarOpen(true)}
            />
          )}
        </div>
      </div>

      <main className="flex flex-1 flex-col">

        {(!selection || error || (selection && !loading && lessons.length === 0)) && (
          <div className="flex flex-1 items-center justify-center px-6 py-12">
            <div className="flex max-w-xl flex-col items-center gap-6 text-center [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
              {!selection && (
                <>
                  <CalendarSearch
                    className="size-16 text-muted md:size-24"
                    style={{ strokeWidth: 1.25 }}
                  />
                  <p className="text-xl font-medium text-muted md:text-3xl">
                    Введите номер группы или имя преподавателя, чтобы увидеть расписание
                  </p>
                </>
              )}
              {error && (
                <p className="text-2xl font-medium text-red-700 md:text-4xl">{error}</p>
              )}
              {selection && !loading && !error && lessons.length === 0 && (
                <p className="text-2xl font-medium text-muted md:text-4xl">Расписание не найдено</p>
              )}
            </div>
          </div>
        )}

        {selection && (loading || lessons.length > 0) && (
          <div className="mx-auto w-full max-w-[1140px] px-3 pb-10 md:px-6 md:pb-14 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
            {loading ? (
              <ScheduleSkeleton />
            ) : (
              <Schedule
                lessons={lessons}
                monday={monday}
                byTeacher={!!teacherId}
                onOpenStudio={setStudioLesson}
                holidays={holidays}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-line pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-[1140px] px-3 py-7 text-center  text-muted md:px-6">
          <p className="text-base font-medium">Школа креативных индустрий г. Строитель</p>
          <div className="mt-3 mb-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-base underline ">
            <a href="https://vk.com/shkistroitel" className="transition-colors hover:text-brand">ВКонтакте</a>
            <a href="https://vk.com/away.php?to=https%3A%2F%2Fweb.max.ru%2F-69221720244297&utf=1" className="transition-colors hover:text-brand">MAX</a>
            <a href="https://rutube.ru/channel/77788736/" className="transition-colors hover:text-brand">RUTUBE</a>
          </div>
          <a href="https://vk.com/kir1lka" className="text-sm text-muted/70 transition-colors hover:text-brand ">Made by kirill</a>
        </div>
      </footer>

      <ScrollTopButton />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {calendarOpen && (
        <CalendarModal
          open
          onClose={() => setCalendarOpen(false)}
          monday={monday}
          onSelect={setMonday}
        />
      )}

      <StudioSheet
        open={!!studioLesson}
        onClose={() => setStudioLesson(null)}
        lesson={studioLesson}
        studios={studios}
      />
    </div>
  )
}
