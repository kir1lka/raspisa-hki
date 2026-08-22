import { useState, useEffect, useLayoutEffect } from 'react'

export function useUiSettings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('ui-zoom')) || 1)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)

    // theme-color красит системную полосу на телефоне (статус-бар в iOS,
    // шапку браузера в Android). Без обновления она оставалась цвета
    // прошлой темы и не совпадала с сайтом.
    //
    // Обновляем цвет до отрисовки нового кадра. Safari также смотрит на фон
    // корневого элемента, поэтому задаём его явно вместе с color-scheme.
    const color = theme === 'dark' ? '#15171c' : '#e9e9e9'
    document.documentElement.style.colorScheme = theme
    document.documentElement.style.backgroundColor = color

    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = color
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
