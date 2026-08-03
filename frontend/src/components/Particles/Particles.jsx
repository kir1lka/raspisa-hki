import { useEffect, useRef, useState } from 'react'

const COUNT = 70
const SPEED = 0.06 // пикселей за кадр — намеренно очень медленно
const LINK_DIST = 130

/**
 * Медленно плывущие частицы с линиями между близкими соседями.
 * Работает только в тёмной теме: на светлом фоне сетка выглядит грязно.
 *
 * Канвас лежит под содержимым и не ловит клики. При prefers-reduced-motion
 * и на вкладке в фоне анимация не крутится.
 */
export default function Particles() {
  const canvasRef = useRef(null)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Тема хранится классом на <html>, поэтому следим за ним, а не за пропсом:
  // так компонент не зависит от того, на какой странице его подключили.
  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!dark) return
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
      dots = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED * 2,
        vy: (Math.random() - 0.5) * SPEED * 2,
        r: 1 + Math.random() * 1.4,
      }))
    }

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim() || '#3b82f6'

    const draw = () => {
      const color = accent()
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
          if (dist > LINK_DIST) continue
          ctx.globalAlpha = (1 - dist / LINK_DIST) * 0.16
          ctx.beginPath()
          ctx.moveTo(dots[i].x, dots[i].y)
          ctx.lineTo(dots[j].x, dots[j].y)
          ctx.stroke()
        }
      }

      ctx.fillStyle = color
      ctx.globalAlpha = 0.4
      for (const d of dots) {
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      raf = requestAnimationFrame(draw)
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
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [dark])

  if (!dark) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 size-full"
    />
  )
}
