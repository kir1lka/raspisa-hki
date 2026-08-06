import { useState, useEffect } from 'react'

export function useUiSettings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('ui-zoom')) || 0.9)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)

    // theme-color красит системную полосу на телефоне (статус-бар в iOS,
    // шапку браузера в Android). Без обновления она оставалась цвета
    // прошлой темы и не совпадала с сайтом.
    //
    // Тегов в документе ДВА: один свой из index.html, второй дописывает
    // vite-plugin-pwa из theme_color манифеста. Раньше querySelector правил
    // только первый, второй навсегда оставался светлым — и браузеры, которые
    // берут последний подходящий, показывали полосу цвета старой темы.
    // Поэтому обновляем все, сколько бы их ни было.
    const color = theme === 'dark' ? '#15171c' : '#e9e9e9'
    const metas = document.querySelectorAll('meta[name="theme-color"]')
    if (metas.length === 0) {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
      meta.content = color
    } else {
      metas.forEach((m) => { m.content = color })
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-zoom', String(zoom))
    localStorage.setItem('ui-zoom', String(zoom))
  }, [zoom])

  return {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    zoom,
    setZoom,
  }
}
