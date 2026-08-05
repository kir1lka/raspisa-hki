import { useEffect, useRef } from 'react'
import { useIsDark } from '../../useIsDark'
import { useBgEffects } from '../../useBgEffects'

const SPEED = 0.06 // пикселей за кадр — намеренно очень медленно

// На телефоне экран меньше, и то же число точек выглядит кашей.
// Считаем по площади окна, а не по фиксированному числу.
const countFor = (w) => (w < 640 ? 24 : w < 1024 ? 45 : 70)
const linkDistFor = (w) => (w < 640 ? 90 : 130)

/**
 * Медленно плывущие частицы с линиями между близкими соседями.
 * Работают в обеих темах, цвет берётся из акцента: синий в тёмной,
 * оранжевый в светлой.
 *
 * Канвас лежит под содержимым и не ловит клики. При prefers-reduced-motion
 * и на вкладке в фоне анимация не крутится.
 */
export default function Particles() {
  const canvasRef = useRef(null)
  const dark = useIsDark()
  const enabled = useBgEffects()

  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let w = 0
    let h = 0
    let dots = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      dots = Array.from({ length: countFor(w) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: 1 + Math.random() * 1.4,
      }))
    }

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim() || '#3b82f6'

    // Ограничиваем 30 кадрами в секунду: связи считаются попарно, это
    // самая тяжёлая часть, а движение медленное — разницы на глаз нет,
    // зато телефон греется заметно меньше.
    let last = 0
    const draw = (now = 0) => {
      raf = requestAnimationFrame(draw)
      if (now - last < 33) return
      last = now

      const color = accent()
      const linkDist = linkDistFor(w)
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        // мягкий разворот у краёв вместо телепорта
        if (d.x < 0 || d.x > w) d.vx *= -1
        if (d.y < 0 || d.y > h) d.vy *= -1
      }

      ctx.strokeStyle = color
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x
          const dy = dots[i].y - dots[j].y
          const dist = Math.hypot(dx, dy)
          if (dist > linkDist) continue
          // На светлом фоне оранжевый читается слабее синего на тёмном,
          // поэтому там линии и точки чуть плотнее.
          ctx.globalAlpha = (1 - dist / linkDist) * (dark ? 0.16 : 0.26)
          ctx.beginPath()
          ctx.moveTo(dots[i].x, dots[i].y)
          ctx.lineTo(dots[j].x, dots[j].y)
          ctx.stroke()
        }
      }

      ctx.fillStyle = color
      ctx.globalAlpha = dark ? 0.4 : 0.55
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const start = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(draw)
    }
    const stop = () => cancelAnimationFrame(raf)
    const onVisibility = () => (document.hidden ? stop() : start())
    const onResize = () => {
      resize()
      seed()
    }

    resize()
    seed()
    start()
    // ResizeObserver, а не только событие окна: на скрытой вкладке размер
    // канваса на момент запуска может быть нулевым, и без наблюдателя
    // он таким и останется, пока окно не поменяет размер.
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dark, enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 size-full"
    />
  )
}
