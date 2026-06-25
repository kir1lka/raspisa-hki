import { useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { hhmm, endTime, isCurrentLesson } from '../../utils'
import studioVr from '../../assets/studio-vr.png'
import studioDesign from '../../assets/studio-design.png'
import studioSound from '../../assets/studio-sound.png'
import studioPhoto from '../../assets/studio-photo.png'
import studioAnimation from '../../assets/studio-animation.png'
import studioMusic from '../../assets/studio-music.png'
import studioEvent from '../../assets/studio-event.png'

const SHOW_ILLUSTRATION = false

function illustrationFor(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('vr') || n.includes('интерактив')) return studioVr
  if (n.includes('дизайн')) return studioDesign
  if (n.includes('звук')) return studioSound
  if (n.includes('фото') || n.includes('видео')) return studioPhoto
  if (n.includes('анимац')) return studioAnimation
  if (n.includes('электрон') || n.includes('музык')) return studioMusic
  return studioVr
}

export default function LessonCard({ lesson, index = 0, byTeacher = false, highlightCurrent = true, onOpenStudio }) {
  const illustration = lesson.special ? studioEvent : illustrationFor(lesson.studioName)
  const current = highlightCurrent && isCurrentLesson(lesson)
  const [pulseKey, setPulseKey] = useState(0)

  return (
    <article
      id={`lesson-${lesson.id}`}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => {
        setPulseKey((k) => k + 1)
        onOpenStudio?.(lesson)
      }}
      className={
        'group relative flex min-h-[120px] animate-fade-up cursor-pointer overflow-hidden rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] bg-surface transition duration-150 select-none hover:border-accent active:scale-[0.98] active:border-accent md:min-h-[160px] ' +
        (current ? 'border-brand' : 'border-line')
      }
    >
      {pulseKey > 0 && (
        <span
          key={pulseKey}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 animate-click-pulse rounded-card"
        />
      )}

      {SHOW_ILLUSTRATION && (
        <div
          aria-hidden
          className={
            'pointer-events-none absolute inset-0 transition-colors ' +
            (current ? 'bg-brand group-hover:bg-accent' : 'bg-line/70')
          }
          style={{
            WebkitMaskImage: `url(${illustration})`,
            maskImage: `url(${illustration})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'right center',
            maskPosition: 'right center',
            WebkitMaskSize: 'auto 100%',
            maskSize: 'auto 100%',
          }}
        />
      )}

      <div className="relative z-10 flex w-20 shrink-0 flex-col items-center justify-between py-5 md:w-28 md:py-7">
        <span className="text-base text-ink md:text-2xl">{hhmm(lesson.time)}</span>

        {!lesson.special ? (
          <span className="relative text-2xl font-bold text-ink md:text-[32px]">
            {current && (
              <ChevronRight
                className="absolute top-1/2 right-full mr-1 size-5 -translate-y-1/2 text-brand transition-colors group-hover:text-accent md:size-6"
                strokeWidth={2.5}
              />
            )}
            {lesson.orderNumber}
          </span>
        ) : (
          <span className="text-3xl leading-none font-bold text-muted md:text-4xl">–</span>
        )}
        <span className="text-base text-ink md:text-2xl">
          {lesson.special && lesson.endTime ? hhmm(lesson.endTime) : endTime(lesson.time)}
        </span>
      </div>

      <div className="relative z-10 my-5 w-0.5 shrink-0 self-stretch rounded-card bg-sep md:my-7" />

      <div className="relative z-10 flex flex-col justify-center gap-2 px-5 py-5 md:px-7">
        <h3 className="text-halo text-xl font-medium leading-tight text-ink md:text-[32px]">
          {lesson.special && <Sparkles className="mr-1.5 inline-block size-5 align-[-0.15em] text-brand md:size-7" />}
          {lesson.special
            ? lesson.title || lesson.studioName
            : byTeacher
              ? `${lesson.groupNumber} группа`
              : lesson.studioName}
        </h3>
        <p className="text-halo text-sm text-ink md:text-xl">
          {lesson.special
            ? `Место проведения: ${lesson.studioName}`
            : byTeacher
              ? lesson.studioName
              : `пр. ${lesson.teacherName}`}
        </p>
      </div>
    </article>
  )
}
