import { useState, useEffect } from 'react'

/**
 * Следит за темой по классу на <html>, а не по пропсу: фоновые эффекты
 * подключены один раз в App и не знают, на какой они странице.
 */
export function useIsDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  return dark
}
