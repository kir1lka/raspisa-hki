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
 */
export default function TabBar({ active = 'schedule' }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-5">
      <div className="fade-layer fade-layer-bottom" aria-hidden />

      <nav className="pointer-events-auto flex gap-1 rounded-full border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface/95 p-1.5 shadow-[0_14px_34px_-10px_rgba(0,0,0,.5)] backdrop-blur-lg [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
        {TABS.map((t) => (
          <NavLink
            key={t.key}
            to={t.to}
            className={
              'rounded-full px-5 py-2.5 text-[13px] font-bold transition ' +
              (active === t.key
                ? 'bg-gradient-to-br from-brand-light to-brand text-white'
                : 'text-muted hover:text-brand')
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
