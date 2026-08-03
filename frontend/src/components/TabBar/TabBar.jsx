import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Расписание', key: 'schedule' },
  { to: '/studios', label: 'Студии', key: 'studios' },
  { to: '/events', label: 'События', key: 'events' },
]

/**
 * Плавающая нижняя навигация.
 *
 * Обёртка растянута на всю ширину окна и не ловит клики: без неё подложка
 * шириной с саму панель обрезалась бы по её краям, а полоса высотой 140px
 * перехватывала бы нажатия по карточкам под ней.
 *
 * Активная вкладка подсвечивается отдельной плашкой, которая переезжает
 * между кнопками — так переключение видно и при нажатии, и при свайпе.
 */
export default function TabBar({ active = 'schedule' }) {
  const navRef = useRef(null)
  const [pill, setPill] = useState(null)
  const [ready, setReady] = useState(false)

  // Позицию считаем по реальной кнопке: ширина зависит от длины подписи
  // и от масштаба интерфейса, формулой её не задать.
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const measure = () => {
      const el = nav.querySelector(`[data-tab="${active}"]`)
      if (!el) return
      setPill({ left: el.offsetLeft, width: el.offsetWidth })
      // Переход включаем сразу после первого замера: плашка к этому моменту
      // уже стоит на месте, поэтому «приезда» из левого края не будет.
      setReady(true)
    }

    measure()
    // Следим за каждой кнопкой, а не только за панелью: подписи меняют
    // ширину после подгрузки шрифта, а размер самой панели при этом
    // может не измениться — и плашка осталась бы смещённой.
    const ro = new ResizeObserver(measure)
    ro.observe(nav)
    nav.querySelectorAll('[data-tab]').forEach((el) => ro.observe(el))
    document.fonts?.ready.then(measure).catch(() => {})
    return () => ro.disconnect()
  }, [active])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-5">
      <div className="fade-layer fade-layer-bottom" aria-hidden />

      <nav
        ref={navRef}
        className="pointer-events-auto relative flex gap-1 rounded-full border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface/95 p-1.5 shadow-[0_14px_34px_-10px_rgba(0,0,0,.5)] backdrop-blur-lg [zoom:calc(var(--ui-base)*var(--ui-zoom))]"
      >
        {pill && (
          <span
            aria-hidden
            className={
              'absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-br from-brand-light to-brand ' +
              (ready ? 'transition-all duration-300 ease-out' : '')
            }
            style={{ left: pill.left, width: pill.width }}
          />
        )}

        {TABS.map((t) => (
          <NavLink
            key={t.key}
            to={t.to}
            data-tab={t.key}
            className={
              'relative rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors duration-200 ' +
              (active === t.key ? 'text-white' : 'text-muted hover:text-brand')
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
