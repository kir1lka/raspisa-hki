import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30">
      <div className="mx-auto flex max-w-[1140px] justify-end px-5 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
        <button
          type="button"
          title="Наверх"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={
            'pointer-events-auto flex size-12 items-center justify-center rounded-full ' +
            'bg-brand text-white shadow-lg transition-all hover:bg-brand-light active:scale-95 md:size-14 ' +
            (visible ? 'opacity-100' : 'pointer-events-none opacity-0')
          }
        >
          <ArrowUp className="size-6 md:size-7" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
