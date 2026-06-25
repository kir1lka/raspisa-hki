import LessonCard from '../LessonCard/LessonCard'
import HolidayCard from '../HolidayCard/HolidayCard'
import { DAY_NAMES } from '../../utils'
import { fmtDayMonth } from '../../dates'

export default function DaySection({ day, date, status, lessons, byTeacher = false, isToday = false, onOpenStudio }) {

  const isOff = status.type !== 'school'
  const events = lessons.filter((l) => l.special)
  const visibleLessons = isOff ? events : lessons
  const showHolidayCard = isOff && events.length === 0

  return (
    <section id={`day-${day}`}>

      <h2
        className={
          'sticky top-0 z-20 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] py-3 text-center text-2xl font-semibold md:py-4 md:text-[32px] ' +
          (isToday
            ? 'border-brand-ring bg-gradient-to-r from-brand-light to-brand text-white'
            : 'border-line bg-day-off text-muted')
        }
      >
        {DAY_NAMES[day]}, {fmtDayMonth(date)}
      </h2>

      <div className="mt-3 flex flex-col gap-3 md:mt-4 md:gap-4">
        {showHolidayCard ? (
          <HolidayCard label={status.label} type={status.type} name={status.name} />
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
