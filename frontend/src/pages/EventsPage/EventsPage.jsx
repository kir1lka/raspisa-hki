import { useState, useEffect } from 'react'
import AppHeader from '../../components/AppHeader/AppHeader'
import TabBar from '../../components/TabBar/TabBar'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import StudioSheet from '../../components/StudioSheet/StudioSheet'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import { fetchAllLessons, fetchStudios } from '../../api'
import { getCached, loadCached } from '../../cache'
import { useUiSettings } from '../../useUiSettings'
import { useSwipeTabs } from '../../useSwipeTabs'
import { hhmm } from '../../utils'
import { MONTHS_NOM, parseIsoLocal, startOfDay } from '../../dates'

const MONTH_SHORT = MONTHS_NOM.map((m) => m.slice(0, 3).toLowerCase())

// embedded — см. StudiosPage: обвязку рисует общий каркас MainTabs.
export default function EventsPage({ embedded = false }) {
  const { theme, toggleTheme, zoom, setZoom } = useUiSettings()
  useSwipeTabs('/events')
  // Как и на «Студиях»: при повторном заходе данные берутся из памяти
  const [events, setEvents] = useState(() => getCached('events') ?? [])
  const [loading, setLoading] = useState(() => !getCached('events'))
  const [studios, setStudios] = useState(() => getCached('studios') ?? [])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openEvent, setOpenEvent] = useState(null)

  useEffect(() => {
    loadCached('events', () =>
      fetchAllLessons().then((all) =>
        all.filter((l) => l.special && l.date).sort((a, b) => a.date.localeCompare(b.date)),
      ),
    )
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))

    loadCached('studios', fetchStudios).then(setStudios).catch(() => setStudios([]))
  }, [])

  // Показываем только текущий месяц и только то, что ещё впереди — иначе
  // страница со временем превращается в архив прошедшего. Список сам худеет
  // к концу месяца и сам наполняется, когда наступает следующий: ничего
  // переключать руками не нужно.
  //
  // Граница — по дню, а не по времени: мероприятие, которое идёт или уже
  // закончилось сегодня, остаётся до конца суток. Так на вкладку можно зайти
  // вечером и увидеть, что было днём.
  const today = startOfDay(new Date())
  const monthTitle = `${MONTHS_NOM[today.getMonth()]} ${today.getFullYear()}`
  const upcoming = events.filter((e) => {
    const d = parseIsoLocal(e.date)
    return d >= today && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  })

  return (
    <div className={embedded ? 'w-full' : 'flex min-h-[100dvh] flex-col [--ui-base:1]'}>
      {!embedded && (
        <AppHeader
          title="События"
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[772px] px-3 pt-[18px] pb-10 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          {loading ? (
            <div className="flex animate-pulse flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-stretch gap-4 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line px-4 py-4"
                >
                  <div className="h-[58px] w-[62px] shrink-0 rounded-tile bg-line/50" />
                  <div className="flex flex-1 flex-col justify-center gap-2">
                    <div className="h-4 w-2/3 rounded bg-line/50" />
                    <div className="h-3 w-1/2 rounded bg-line/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-dashed border-line px-5 py-10 text-center text-base text-muted">
              {/* Разделяем два случая: мероприятий в базе нет вообще или все
                  в этом месяце уже прошли. Иначе непонятно, почему пусто. */}
              {events.length === 0
                ? 'Мероприятий пока нет'
                : 'В этом месяце мероприятий больше нет'}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Подпись месяца: без неё короткий список выглядит так, будто
                  часть мероприятий потерялась. */}
              <p className="mb-1 text-center text-[13px] font-bold tracking-[0.11em] text-muted uppercase">
                {monthTitle}
              </p>
              {upcoming.map((e, i) => {
                const d = parseIsoLocal(e.date)
                return (
                  <article
                    key={e.id}
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => setOpenEvent(e)}
                    className="flex animate-fade-up cursor-pointer items-start gap-4 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-transparent px-4 py-4 transition select-none hover:-translate-y-0.5 [background:linear-gradient(var(--color-surface),var(--color-surface))_padding-box,linear-gradient(135deg,var(--color-brand-ring),var(--color-brand))_border-box]"
                  >
                    {/* items-start у карточки: иначе квадрат с датой растягивался
                        по высоте, когда название переносилось на две строки */}
                    <div className="flex w-[62px] shrink-0 flex-col items-center justify-center rounded-tile border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-canvas py-2 tabular-nums">
                      <b className="text-xl font-extrabold tracking-tight text-ink">{d.getDate()}</b>
                      <i className="text-[11px] font-bold tracking-[0.1em] text-muted uppercase not-italic">
                        {MONTH_SHORT[d.getMonth()]}
                      </i>
                    </div>

                    <div className="flex min-w-0 flex-col justify-center gap-1">
                      {/* Звёздочка внутри строки, а не отдельным flex-элементом:
                          так вторая строка названия идёт под ней, а не с отступом */}
                      <h3 className="text-[18px] leading-snug font-bold text-ink">
                        <span className="mr-1.5 text-[1.15em] text-brand">✦</span>
                        {e.title || e.studioName}
                      </h3>
                      <p className="text-sm leading-snug text-muted">
                        {hhmm(e.time)}
                        {e.endTime ? ` – ${hhmm(e.endTime)}` : ''} · {e.studioName}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {!embedded && (
        <>
          <SiteFooter />
          <TabBar active="events" />
          <SettingsModal
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            theme={theme}
            onToggleTheme={toggleTheme}
            zoom={zoom}
            onZoomChange={setZoom}
            showTheme={false}
          />
        </>
      )}

      <StudioSheet
        open={!!openEvent}
        onClose={() => setOpenEvent(null)}
        lesson={openEvent}
        studios={studios}
      />
    </div>
  )
}
