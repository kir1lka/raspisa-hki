import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Порядок вкладок совпадает с нижней навигацией.
const TABS = ['/', '/studios', '/events']

const MIN_DISTANCE = 70 // px по горизонтали
const MAX_VERTICAL = 60 // если увели палец вверх/вниз — это прокрутка, не свайп
const MAX_TIME = 700 // мс: медленное перетаскивание свайпом не считаем

/**
 * Свайп влево-вправо переключает вкладки: расписание → студии → события.
 *
 * Слушаем на window, но игнорируем жесты, начатые внутри окон и лент
 * с горизонтальной прокруткой — иначе свайп по фотографиям студии
 * пролистывал бы страницу.
 */
export function useSwipeTabs(current) {
  const navigate = useNavigate()

  useEffect(() => {
    const index = TABS.indexOf(current)
    if (index === -1) return

    let x = 0
    let y = 0
    let t = 0
    let ignore = false

    const onStart = (e) => {
      const touch = e.touches[0]
      x = touch.clientX
      y = touch.clientY
      t = Date.now()
      // Всплывающие окна и любые прокручиваемые вбок ленты жест не отдают
      ignore = !!e.target.closest?.('[data-no-swipe], [role="dialog"], .overflow-x-auto')
    }

    const onEnd = (e) => {
      if (ignore) return
      const touch = e.changedTouches[0]
      const dx = touch.clientX - x
      const dy = touch.clientY - y
      if (Date.now() - t > MAX_TIME) return
      if (Math.abs(dy) > MAX_VERTICAL) return
      if (Math.abs(dx) < MIN_DISTANCE) return

      const next = dx < 0 ? index + 1 : index - 1
      if (next < 0 || next >= TABS.length) return
      navigate(TABS[next])
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [current, navigate])
}
