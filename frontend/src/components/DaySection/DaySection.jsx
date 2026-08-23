import { useEffect, useRef } from 'react'
import LessonCard from '../LessonCard/LessonCard'
import HolidayCard from '../HolidayCard/HolidayCard'
import { DAY_NAMES, MONTHS_SHORT_LOWER, lessonsWord } from '../../utils'

/**
 * День недели: календарная плашка с числом, названием и счётчиком,
 * под ней карточки занятий.
 *
 * Плашка липкая и останавливается под шапкой. Рамки и «карточной» заливки
 * у неё нет — иначе она читается как ещё одно занятие и сливается со списком.
 */
export default function DaySection({ day, date, status, lessons, byTeacher = false, isToday = false, onOpenStudio }) {
  const headingRef = useRef(null)
  const isOff = status.type !== 'school'
  const events = lessons.filter((l) => l.special)
  const visibleLessons = isOff ? events : lessons
  const showHolidayCard = isOff && events.length === 0

  // В счётчике справа: для каникул и праздников — их название,
  // для учебного дня — количество занятий.
  const counter = isOff ? status.label : visibleLessons.length ? lessonsWord(visibleLessons.length) : 'свободно'

  // Общая подложка шапки продлевается ровно на визуальную высоту прилипшего
  // дня. getBoundingClientRect учитывает пользовательский zoom.
  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const apply = () => {
      document.documentElement.style.setProperty('--day-heading-h', `${el.getBoundingClientRect().height}px`)
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    /* scroll-margin равен высоте шапки: без него автопрокрутка к сегодняшнему
       дню останавливалась ровно под ней и плашка оказывалась перекрыта. */
    <section
      id={`day-${day}`}
      className="scroll-mt-[calc((var(--header-h,84px)+9px)/(var(--ui-base)*var(--ui-zoom)))]"
    >
      <div
        ref={headingRef}
        className={
          // --header-h приходит в обычных пикселях, а плашка живёт внутри
          // блока с zoom — поэтому делим на масштаб, иначе отступ уедет.
          'app-day-heading sticky top-[calc((var(--header-h,84px)+5px)/(var(--ui-base)*var(--ui-zoom)))] z-20 mb-3.5 flex items-center gap-3 rounded-card px-3 py-2 ' +
          (isToday
            ? 'border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-white/40 bg-gradient-to-br from-brand-light to-brand text-white'
            : 'border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-canvas')
        }
      >
        <span
          className={
            'grid size-11 shrink-0 place-items-center rounded-tile border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] text-lg font-extrabold tabular-nums ' +
            (isToday ? 'border-transparent bg-white/25 text-white' : 'border-line bg-surface text-ink')
          }
        >
          {date.getDate()}
        </span>

        <span className="flex min-w-0 flex-col leading-tight">
          <b className="text-[15px] font-extrabold tracking-tight">{DAY_NAMES[day]}</b>
          <i
            className={
              'text-[11px] font-bold tracking-[0.11em] uppercase not-italic ' +
              (isToday ? 'text-white/80' : 'text-muted')
            }
          >
            {MONTHS_SHORT_LOWER[date.getMonth()]}
          </i>
        </span>

        <span
          className={
            'ml-auto shrink-0 rounded-full border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] px-3 py-1.5 text-xs font-bold whitespace-nowrap ' +
            (isToday ? 'border-transparent bg-white/25 text-white' : 'border-line bg-surface text-muted')
          }
        >
          {counter}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {showHolidayCard ? (
          <HolidayCard label={status.label} type={status.type} name={status.name} />
        ) : visibleLessons.length === 0 ? (
          <div className="rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-dashed border-line px-5 py-6 text-center text-base text-muted">
            Занятий нет
          </div>
        ) : (
          visibleLessons.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              byTeacher={byTeacher}
              highlightCurrent={isToday}
              onOpenStudio={onOpenStudio}
            />
          ))
        )}
      </div>
    </section>
  )
}
