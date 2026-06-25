import { useState } from 'react'
import confetti from 'canvas-confetti'
import holidayImg from '../../assets/holiday.png'
import vacationImg from '../../assets/vacation.png'

const SHOW_ILLUSTRATION = false

export default function HolidayCard({ label, type, name }) {
  const image = type === 'holiday' ? holidayImg : vacationImg
  const [active, setActive] = useState(false)

  function handleClick(e) {

    confetti({
      particleCount: 120,
      spread: 80,
      startVelocity: 40,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    })

    setActive(false)
    requestAnimationFrame(() => setActive(true))
  }

  return (
    <article
      onClick={handleClick}
      onAnimationEnd={() => setActive(false)}
      className={
        'relative flex min-h-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] bg-surface transition duration-150 select-none active:scale-[0.98] md:min-h-[160px] ' +
        (active ? 'animate-border-rainbow' : 'border-line')
      }
    >
      {SHOW_ILLUSTRATION && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-line/70"
          style={{
            WebkitMaskImage: `url(${image})`,
            maskImage: `url(${image})`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'right center',
            maskPosition: 'right center',
            WebkitMaskSize: 'auto 100%',
            maskSize: 'auto 100%',
          }}
        />
      )}
      <span className="text-halo relative z-10 flex flex-col items-center gap-1 px-4 text-center">
        <span className="text-2xl font-bold text-ink md:text-[32px]">{name || label}</span>
      </span>
    </article>
  )
}
