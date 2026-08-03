import { useIsDark } from '../../useIsDark'
import { useBgEffects } from '../../useBgEffects'

// Один цвет на всю сцену, свой для каждой темы.
const ORANGE = '#ff8400'
const BLUE = '#3b82f6'

// Значения из исходного эффекта: у каждого шара своя точка вращения,
// длительность и отрицательная задержка — иначе они пошли бы строем.
const BALLS = [
  { top: '77%', left: '88%', duration: 40, delay: -3, origin: '16vw -2vh', shadow: '40vmin' },
  { top: '42%', left: '2%', duration: 53, delay: -29, origin: '-19vw 21vh', shadow: '-40vmin' },
  { top: '28%', left: '18%', duration: 49, delay: -8, origin: '-22vw 3vh', shadow: '40vmin' },
  { top: '50%', left: '79%', duration: 26, delay: -21, origin: '-17vw -6vh', shadow: '40vmin' },
  { top: '46%', left: '15%', duration: 36, delay: -40, origin: '4vw 0vh', shadow: '-40vmin' },
  { top: '77%', left: '16%', duration: 31, delay: -10, origin: '18vw 4vh', shadow: '40vmin' },
  { top: '22%', left: '17%', duration: 55, delay: -6, origin: '1vw -23vh', shadow: '-40vmin' },
  { top: '41%', left: '47%', duration: 43, delay: -28, origin: '25vw -3vh', shadow: '40vmin' },
]

/**
 * Шары, медленно плывущие по фону: оранжевые в светлой теме, синие в тёмной.
 *
 * Фон контейнер не заливает — страница остаётся своего цвета, видно только
 * размытые тени шаров. Поверх них ещё идут частицы (см. Particles).
 */
export default function WarmBackdrop() {
  const dark = useIsDark()
  const enabled = useBgEffects()
  const color = dark ? BLUE : ORANGE

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BALLS.map((b, i) => (
        <span
          key={i}
          className="ball"
          style={{
            top: b.top,
            left: b.left,
            color,
            transformOrigin: b.origin,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            // Размытие сильно больше исходного — пятна должны быть мягкими,
            // а не читаться как отдельные круги.
            boxShadow: `${b.shadow} 0 16vmin currentColor`,
            opacity: 0.32,
          }}
        />
      ))}
    </div>
  )
}
