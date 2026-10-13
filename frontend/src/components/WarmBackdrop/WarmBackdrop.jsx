import { useIsDark } from '../../useIsDark'
import { useBgEffects } from '../../useBgEffects'

// Один цвет на всю сцену, свой для каждой темы.
const ORANGE = '#ff8400'
const BLUE = '#3b82f6'

// Значения из исходного эффекта: у каждого шара своя точка вращения,
// длительность и отрицательная задержка — иначе они пошли бы строем.
const BALLS = [
  { top: '77%', left: '88%', duration: 40, delay: -3, origin: '16vw -2lvh' },
  { top: '42%', left: '2%', duration: 53, delay: -29, origin: '-19vw 21lvh' },
  { top: '28%', left: '18%', duration: 49, delay: -8, origin: '-22vw 3lvh' },
  { top: '50%', left: '79%', duration: 26, delay: -21, origin: '-17vw -6lvh' },
  { top: '46%', left: '15%', duration: 36, delay: -40, origin: '4vw 0lvh' },
  { top: '77%', left: '16%', duration: 31, delay: -10, origin: '18vw 4lvh' },
  { top: '22%', left: '17%', duration: 55, delay: -6, origin: '1vw -23lvh' },
  { top: '41%', left: '47%', duration: 43, delay: -28, origin: '25vw -3lvh' },
]

/**
 * Шары, медленно плывущие по фону: оранжевые в светлой теме, синие в тёмной.
 *
 * Фон контейнер не заливает — страница остаётся своего цвета, видно только
 * мягкие радиальные градиенты. Поверх них ещё идут частицы (см. Particles).
 */
export default function WarmBackdrop() {
  const dark = useIsDark()
  const enabled = useBgEffects()
  const color = dark ? BLUE : ORANGE

  if (!enabled) return null


  return (
    <div aria-hidden className="live-background pointer-events-none fixed left-0 top-0 -z-10 w-full overflow-hidden">
      {BALLS.map((b, i) => (
        <span
          key={i}
          /* На телефоне половину пятен прячем, чтобы фон оставался лёгким.
             Через CSS, а не через JS — иначе не реагирует на поворот экрана. */
          className={'ball ' + (i >= 4 ? 'max-sm:hidden' : '')}
          style={{
            top: b.top,
            left: b.left,
            color,
            transformOrigin: b.origin,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            opacity: 0.32,
          }}
        />
      ))}
    </div>
  )
}
