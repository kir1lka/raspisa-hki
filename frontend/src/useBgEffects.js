import { useState, useEffect } from 'react'

const KEY = 'bg-effects'
const EVENT = 'bg-effects-change'

/** Живые обои включены? По умолчанию да. */
export function getBgEffects() {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

export function setBgEffects(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // приватный режим — настройка просто не переживёт перезагрузку
  }
  // Своё событие: storage срабатывает только в других вкладках,
  // а переключатель и сами эффекты живут в одной.
  window.dispatchEvent(new Event(EVENT))
}

export function useBgEffects() {
  const [on, setOn] = useState(getBgEffects)

  useEffect(() => {
    const sync = () => setOn(getBgEffects())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return on
}
