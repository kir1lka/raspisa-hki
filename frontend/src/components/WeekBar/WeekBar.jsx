import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { fmtWeekRange } from '../../dates'

export default function WeekBar({ monday, onPrev, onNext, onOpenCalendar }) {
  const btn =
    'flex size-11 shrink-0 items-center justify-center rounded-card text-muted transition hover:text-brand active:scale-95 md:size-14'

  return (
    <div className="mt-2 flex items-center justify-center gap-2 md:mt-3 md:gap-4">
      <button type="button" className={btn} onClick={onPrev} title="Прошлая неделя">
        <ChevronLeft className="size-7 md:size-9" />
      </button>

      <button
        type="button"
        onClick={onOpenCalendar}
        className="flex items-center gap-2 rounded-card px-3 py-1.5 text-xl font-medium text-ink uppercase transition hover:text-brand active:scale-95 md:text-3xl"
      >
        <span className="leading-none">{fmtWeekRange(monday)}</span>
        <CalendarDays className="size-6 shrink-0 md:size-8" />
      </button>

      <button type="button" className={btn} onClick={onNext} title="Следующая неделя">
        <ChevronRight className="size-7 md:size-9" />
      </button>
    </div>
  )
}
