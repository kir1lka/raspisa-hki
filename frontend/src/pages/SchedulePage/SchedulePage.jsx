import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import AppHeader from '../../components/AppHeader/AppHeader'
import TabBar from '../../components/TabBar/TabBar'
import SearchBar from '../../components/SearchBar/SearchBar'
import WeekBar from '../../components/WeekBar/WeekBar'
import Schedule from '../../components/Schedule/Schedule'
import ScheduleSkeleton from '../../components/ScheduleSkeleton/ScheduleSkeleton'
import ScrollTopButton from '../../components/ScrollTopButton/ScrollTopButton'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import CalendarModal from '../../components/CalendarModal/CalendarModal'
import StudioSheet from '../../components/StudioSheet/StudioSheet'
import { fetchGroupLessons, fetchTeacherLessons, fetchGroups, fetchTeachers, fetchHolidays, fetchStudios } from '../../api'
import { setLastSelection } from '../../defaultSelection'
import { getCached, setCache } from '../../cache'
import { useSwipeTabs } from '../../useSwipeTabs'
import { DAY_ORDER } from '../../utils'
import { mondayOf, addDays, sameDay, defaultWeekStart } from '../../dates'

// embedded — страница внутри общего каркаса MainTabs: обвязку рисует он.
// selection — выбранная группа или преподаватель, переданные снаружи.
// Внутри карусели адрес общий на три вкладки: уходя на «Студии», параметры
// маршрута пропадают, и расписание оставалось бы пустым. active — активна ли
// вкладка сейчас: неактивная не должна дёргать прокрутку страницы.
export default function SchedulePage({ base = '', embedded = false, selection: selProp = null, active = true }) {
  const params = useParams()
  const number = params.number ?? (selProp?.type === 'group' ? String(selProp.value) : undefined)
  const teacherId = params.teacherId ?? (selProp?.type === 'teacher' ? String(selProp.value) : undefined)
  const navigate = useNavigate()
  // location.key меняется при КАЖДОМ переходе, даже если адрес тот же самый.
  // По нему отличаем повторный выбор той же группы от отсутствия перехода:
  // number/teacherId в этом случае не меняются, и эффекты сами бы не сработали.
  const { key: navKey } = useLocation()
  const selection = number || teacherId

  // Свайп между вкладками — только на публичных страницах, в админке лишний
  useSwipeTabs(base ? null : '/')

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
  }, [number, navKey])

  useEffect(() => {
    if (teacherId && teachers.length) {
      const t = teachers.find((x) => String(x.id) === String(teacherId))
      if (t) setQuery(t.fullName)
    }
  }, [teacherId, teachers, navKey])

  useEffect(() => {
    if (!selection) {
      setLessons([])
      return
    }
    // Если это расписание уже открывали — показываем его сразу из памяти
    // и обновляем в фоне. Иначе при каждом возврате на вкладку мигал скелетон.
    const key = number ? `lessons:g:${number}` : `lessons:t:${teacherId}`
    const cached = getCached(key)
    if (cached) {
      setLessons(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    setError(null)

    const request = number ? fetchGroupLessons(number) : fetchTeacherLessons(teacherId)
    request
      .then((data) => {
        setCache(key, data)
        setLessons(data)
      })
      .catch((e) => { if (!cached) { setError(e.message); setLessons([]) } })
      .finally(() => setLoading(false))
  }, [number, teacherId, selection, navKey])

  useEffect(() => {
    setMonday((m) => (sameDay(m, defaultWeekStart()) ? m : defaultWeekStart()))
  }, [number, teacherId])

  // Запоминаем открытое расписание: возврат с «Студий» или «Событий»
  // на вкладку «Расписание» откроет его снова, а не пустой поиск.
  useEffect(() => {
    if (base) return
    if (number) setLastSelection({ type: 'group', value: number })
    else if (teacherId) setLastSelection({ type: 'teacher', value: teacherId })
  }, [number, teacherId, base])

  // Подводим к сегодняшнему дню только когда выбрали другую группу или
  // преподавателя. При свайпах и переключении вкладок расписание то же самое —
  // прыгать не нужно, иначе страница уезжает под руками.
  const scrolledFor = useRef(null)

  useEffect(() => {
    if (!lessons.length) return
    if (embedded && !active) return
    const key = `${number || ''}|${teacherId || ''}`
    if (scrolledFor.current === key) return
    scrolledFor.current = key
    const today = new Date()
    const isCurrentWeek = sameDay(monday, mondayOf(today))
    // Раскладка доезжает не сразу: подстраивается высота карусели, дорисовываются
    // шрифты и картинки. Одиночная прокрутка попадала мимо — особенно на телефоне,
    // где сдвиг больше. Поэтому целимся ещё раз, когда всё встало на место.
    const dayId = `day-${DAY_ORDER[(today.getDay() + 6) % 7]}`
    // scrollIntoView здесь использовать нельзя: он прокручивает ВСЕХ
    // прокручиваемых предков, а карусель вкладок — контейнер с overflow:hidden,
    // который браузер тоже считает прокручиваемым. Она уезжала вниз внутри
    // своей коробки, и вернуть её пальцем было невозможно: страница
    // не докручивалась наверх, снизу зиял пустой кусок, а липкие плашки дней
    // переставали приклеиваться. Поэтому считаем смещение сами и двигаем
    // только окно.
    const jump = (behavior) => {
      if (isCurrentWeek) {
        const el = document.getElementById(dayId)
        if (el) {
          const headerH = parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
          ) || 84
          const top = el.getBoundingClientRect().top + window.scrollY - headerH - 14
          window.scrollTo({ top: Math.max(top, 0), behavior })
          return
        }
      }
      window.scrollTo({ top: 0, behavior })
    }

    const raf = requestAnimationFrame(() => jump('smooth'))
    const settle = setTimeout(() => jump('auto'), 450)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
    }
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
    /* --ui-base:1 — на публичных страницах интерфейс в натуральную величину,
       как в макете. Глобально его менять нельзя: тем же множителем ужимается
       админ-панель, а её мы не трогаем. */
    <div className={embedded ? 'w-full' : 'flex min-h-[100dvh] flex-col [--ui-base:1]'}>

      {!embedded && (
        <AppHeader
          title="Расписание"
          to={base ? '/dashboard' : '/login'}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <div>
        {/* pt-[18px] и pb-11 добиваются отступов из макета: 34px до поиска
            (16 даёт шапка) и 44px от панели недели до первой плашки дня. */}
        <div className="mx-auto max-w-[772px] px-3 pt-[18px] pb-11 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            groups={groups}
            teachers={teachers}
            onSelectGroup={(n) => navigate(`${base}/group/${n}`)}
            onSelectTeacher={(id) => navigate(`${base}/teacher/${id}`)}
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
          <div className="mx-auto flex w-full max-w-[772px] flex-1 items-center px-3 pb-10 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
            <div className="flex w-full flex-col items-center gap-3 px-6 py-14 text-center">
              {!selection && (
                <>
                  <p className="max-w-sm text-lg leading-snug font-semibold text-ink">
                    Введите номер группы или имя преподавателя
                  </p>
                  <p className="text-sm text-muted">Расписание появится здесь</p>
                </>
              )}
              {error && <p className="text-lg font-semibold text-red-600">{error}</p>}
              {selection && !loading && !error && lessons.length === 0 && (
                <p className="text-lg font-semibold text-muted">Расписание не найдено</p>
              )}
            </div>
          </div>
        )}

        {selection && (loading || lessons.length > 0) && (
          <div className="mx-auto w-full max-w-[772px] px-3 pb-10 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
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

      {!embedded && <SiteFooter />}
      {!embedded && <ScrollTopButton />}

      {/* В админ-панели нижняя навигация не нужна: она появляется только
          когда открыто расписание найденной группы или преподавателя. */}
      {!embedded && (!base || selection) && <TabBar active="schedule" />}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        zoom={zoom}
        onZoomChange={setZoom}
        groups={groups}
        teachers={teachers}
        showTheme={false}
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
