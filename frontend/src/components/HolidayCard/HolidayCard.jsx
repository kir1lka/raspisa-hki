import { useState } from 'react'
import confetti from 'canvas-confetti'
import { PartyPopper, Palmtree } from 'lucide-react'

/**
 * День без занятий: каникулы или праздник. Название берётся из базы
 * (таблица праздников в админ-панели), поэтому здесь только оформление.
 *
 * Клик осыпает конфетти — поведение осталось от прежней версии.
 */
export default function HolidayCard({ label, type, name }) {
  const [active, setActive] = useState(false)
  const Icon = type === 'holiday' ? PartyPopper : Palmtree

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
      // Событие всплывает от вложенных элементов, а анимации есть и у них:
      // без проверки источника чужой animationend гасил обводку сразу
      // после клика, и она не успевала проиграть.
      onAnimationEnd={(e) => { if (e.target === e.currentTarget) setActive(false) }}
      className={
        // border-line оставляем и во время анимации: пока она играет, цвет
        // перебивают её кадры, а до первого кадра и после последнего рамка
        // возвращается к нормальному серому. Без него в эти моменты цвет
        // падал на currentColor и обводка вспыхивала чёрным.
        'flex animate-fade-up cursor-pointer items-center justify-center gap-2.5 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-dashed border-line px-5 py-5 text-center transition select-none active:scale-[0.99] ' +
        (active ? 'animate-border-rainbow' : '')
      }
    >
      <Icon className="size-6 shrink-0 text-muted" />
      <span className="text-lg font-bold text-ink">{name || label}</span>
    </article>
  )
}
