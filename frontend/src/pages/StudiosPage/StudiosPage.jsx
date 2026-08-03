import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import AppHeader from '../../components/AppHeader/AppHeader'
import TabBar from '../../components/TabBar/TabBar'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import StudioSheet from '../../components/StudioSheet/StudioSheet'
import SiteFooter from '../../components/SiteFooter/SiteFooter'
import { fetchStudios } from '../../api'
import { useUiSettings } from '../../useUiSettings'

export default function StudiosPage() {
  const { theme, toggleTheme, zoom, setZoom } = useUiSettings()
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [openStudio, setOpenStudio] = useState(null)

  useEffect(() => {
    fetchStudios()
      .then(setStudios)
      .catch(() => setStudios([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-[100dvh] flex-col [--ui-base:1]">
      <AppHeader
        title="Студии"
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[772px] px-3 pb-10 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface"
                >
                  <div className="aspect-video bg-line/50" />
                  <div className="px-4 pt-3.5 pb-4">
                    <div className="h-4 w-3/4 rounded bg-line/50" />
                    <div className="mt-2.5 h-3 w-1/2 rounded bg-line/50" />
                  </div>
                </div>
              ))}

            {!loading && studios.map((s) => (
              <article
                key={s.id}
                onClick={() => setOpenStudio(s)}
                className="cursor-pointer overflow-hidden rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface transition select-none hover:-translate-y-0.5 hover:border-brand"
              >
                {/* relative + absolute: у растянутого grid-элемента картинка
                    задавала высоту сама и карточка вырастала под её размер. */}
                <div className="relative aspect-video overflow-hidden border-b-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-canvas">
                  {s.photos?.[0] ? (
                    <img src={s.photos[0]} alt={s.name} className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <ImageIcon className="absolute top-1/2 left-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-muted" />
                  )}
                </div>
                <div className="px-4 pt-3.5 pb-4">
                  <h3 className="text-base leading-snug font-bold text-ink">{s.name}</h3>
                  <p className="mt-1 text-[13px] text-muted">{s.teacherName || 'Зал мероприятий'}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
      <TabBar active="studios" />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        zoom={zoom}
        onZoomChange={setZoom}
        showTheme={false}
      />

      {/* Лист студии переиспользуем как есть: он ищет студию по коду,
          поэтому подсовываем ему «занятие» с нужным кодом. */}
      <StudioSheet
        open={!!openStudio}
        onClose={() => setOpenStudio(null)}
        lesson={
          openStudio && {
            id: `studio-${openStudio.id}`,
            studioCode: openStudio.code,
            studioName: openStudio.name,
            teacherName: openStudio.teacherName,
            special: false,
          }
        }
        studios={studios}
      />
    </div>
  )
}
