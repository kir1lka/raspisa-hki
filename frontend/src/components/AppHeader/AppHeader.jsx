import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun, Settings } from 'lucide-react'

/**
 * Липкая шапка: карточка с названием текущей страницы, переключателем темы
 * и настройками. Название кликабельно и ведёт на вход — как логотип раньше.
 *
 * Подложка под карточкой размыта и растворяется книзу, поэтому содержимое
 * проезжает под шапкой без резкой границы.
 */
// wide — для админ-панели: там содержимое шире (таблицы), и шапка
// должна тянуться по ним, иначе поиск заметно длиннее её.
export default function AppHeader({ title = 'Расписание', to = '/login', theme, onToggleTheme, onOpenSettings, wide = false }) {
  const ref = useRef(null)

  // Высоту шапки замеряем и кладём в CSS-переменную: под неё прилипают
  // заголовки дней. Считать её формулой нельзя — из-за zoom и масштаба
  // интерфейса она меняется и на разных экранах, и при смене настроек.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const height = document.documentElement.classList.contains('ios-standalone') ? 0 : el.offsetHeight
      document.documentElement.style.setProperty('--header-h', `${height}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const iconBtn =
    'grid size-11 shrink-0 place-items-center rounded-tile border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] ' +
    'border-line bg-surface text-muted transition hover:border-brand hover:text-brand active:scale-95'

  // Липким должен быть сам <header>: если обернуть его в блок, который жмётся
  // по высоте содержимого, прилипать будет некуда и шапка уедет вместе со страницей.
  return (
    <header ref={ref} className="app-header sticky top-0 z-40 pt-[env(safe-area-inset-top)]">
      {/* Постоянный слой без переключения при прокрутке: так системная область
          iOS не меняется рывком между сплошной заливкой и размытием. */}
      <div className="fade-layer fade-layer-top z-0" aria-hidden />

      {/* Контейнер такой же, как у содержимого ниже: max-w вместе с боковыми
          отступами. Раньше отступы были на внешнем блоке, и карточка шапки
          выходила шире расписания на ширину этих отступов. */}
      <div className="relative z-10 pt-3 pb-4 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
        <div className={'mx-auto px-3 md:px-6 ' + (wide ? 'max-w-[1140px]' : 'max-w-[772px]')}>
          <div className="flex items-center gap-3 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface px-3.5 py-2.5">
          <Link
            to={to}
            title="Войти"
            className="flex min-w-0 items-center gap-2.5 rounded-tile px-1 transition hover:opacity-80 active:scale-[0.98]"
          >
            <span className="flex min-w-0 flex-col leading-tight">
              <b className="text-xl font-black tracking-tight text-ink">{title}</b>
              <i className="truncate text-[13px] font-semibold text-muted not-italic">
                Школа креативных индустрий
              </i>
            </span>
          </Link>

            <div className="ml-auto flex shrink-0 gap-2">
              <button type="button" className={iconBtn} title="Тема" aria-label="Сменить тему" onClick={onToggleTheme}>
                {theme === 'dark' ? <Sun className="size-6" /> : <Moon className="size-6" />}
              </button>
              <button type="button" className={iconBtn} title="Настройки" aria-label="Настройки" onClick={onOpenSettings}>
                <Settings className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
