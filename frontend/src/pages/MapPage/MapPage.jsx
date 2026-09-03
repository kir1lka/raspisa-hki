import { useEffect, useRef, useState } from 'react'
import { Church, Pause, Play, Trees, Volume2, VolumeX, Waves, X } from 'lucide-react'
import './MapPage.css'

const ATTRACTIONS = [
  {
    id: 'chapel',
    title: 'Храм в Строителе',
    caption: 'Колокольный мотив',
    icon: Church,
    position: { left: '49%', top: '47%' },
    notes: [392, 523.25, 659.25, 523.25, 440, 587.33],
    wave: 'sine',
  },
  {
    id: 'grove',
    title: 'Дубовая роща',
    caption: 'Тихая лесная мелодия',
    icon: Trees,
    position: { left: '26%', top: '36%' },
    notes: [220, 277.18, 329.63, 277.18, 246.94, 293.66],
    wave: 'triangle',
  },
  {
    id: 'river',
    title: 'Берег Ворсклы',
    caption: 'Спокойный водный мотив',
    icon: Waves,
    position: { left: '38%', top: '68%' },
    notes: [261.63, 329.63, 392, 329.63, 293.66, 349.23],
    wave: 'sine',
  },
]

const LOOP_SECONDS = 4.8

function scheduleLoop(context, output, attraction, startAt) {
  attraction.notes.forEach((frequency, index) => {
    const noteStart = startAt + index * 0.72
    const oscillator = context.createOscillator()
    const envelope = context.createGain()

    oscillator.type = attraction.wave
    oscillator.frequency.setValueAtTime(frequency, noteStart)
    envelope.gain.setValueAtTime(0.0001, noteStart)
    envelope.gain.exponentialRampToValueAtTime(0.22, noteStart + 0.06)
    envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.64)
    oscillator.connect(envelope)
    envelope.connect(output)
    oscillator.start(noteStart)
    oscillator.stop(noteStart + 0.68)
  })
}

function LandscapeMark() {
  return (
    <svg className="district-map__landscape" viewBox="0 0 520 250" aria-hidden="true">
      <path className="district-map__sky" d="M0 250C35 183 86 143 151 130c54-11 87 2 131-12 65-20 73-90 148-110 35-9 66-4 90 4v238H0Z" />
      <path className="district-map__hill-back" d="M0 250c56-55 122-74 193-55 51 14 79 17 126-2 74-30 131-26 201 25v32H0Z" />
      <path className="district-map__hill-front" d="M0 250c64-37 126-47 187-27 67 22 103 19 160-7 62-29 116-20 173 14v20H0Z" />
      <g className="district-map__trees">
        <path d="m89 215 17-48 17 48Z" /><path d="m123 220 21-64 21 64Z" />
        <path d="m405 218 18-53 18 53Z" /><path d="m443 222 22-69 22 69Z" />
      </g>
      <g className="district-map__chapel">
        <path d="M284 205v-67h72v67Z" />
        <path d="m276 143 44-37 44 37Z" />
        <path d="M310 111V78h20v33Z" />
        <path d="M306 78c0-13 7-24 14-24s14 11 14 24Z" />
        <path d="M319 54V38M311 46h16" />
        <path d="M298 164h12v41h-12Zm31 0h12v41h-12Z" />
      </g>
      <g className="district-map__clouds">
        <path d="M44 102c3-17 26-21 35-7 10-20 41-11 40 11h-75Z" />
        <path d="M407 75c4-15 24-19 32-7 9-18 35-10 35 9h-67Z" />
      </g>
    </svg>
  )
}

function DistrictOutline() {
  return (
    <svg className="district-map__outline" viewBox="0 0 900 760" role="img" aria-label="Заготовка карты Яковлевского района">
      <defs>
        <filter id="map-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1b3159" floodOpacity="0.12" />
        </filter>
      </defs>
      <path
        className="district-map__region"
        filter="url(#map-shadow)"
        d="M109 178c19-42 58-32 78-15 22 19 42-4 65 1 20 5 24 27 45 20 25-9 36-46 74-49 37-3 42 24 74 17 32-8 39 8 43 29 5 26 42 10 57 30 12 16 24 46 52 37 23-7 23-36 47-35 22 1 18 32 38 37 24 7 37-23 62-17 29 7 17 43 38 55 21 13 51-4 67 20 17 25-7 46 5 70 11 22 42 24 40 54-1 25-25 30-33 52-9 24 17 41-4 64-23 24-50 3-74 16-23 13-9 47-39 56-30 9-42-16-68-19-34-4-48 27-78 16-32-12-35-47-62-53-27-6-43 16-67 5-26-11-19-42-45-49-26-7-44 22-70 10-27-12-14-44-38-58-21-13-47-1-63-22-18-24 2-52-21-70-19-15-46 6-57-19-12-27 11-52-8-69-18-16-43 2-58-21-13-21 9-40-5-60-13-17-36-22-32-49Z"
      />
      <path className="district-map__divider" d="M427 154c-14 92 17 133-23 207-37 70-12 120-64 177-25 28-38 65-44 105" />
      <path className="district-map__divider" d="M405 362c84-7 145 24 218 4 65-18 111 2 157 45" />
      <circle className="district-map__center-dot" cx="443" cy="370" r="10" />
    </svg>
  )
}

export default function MapPage() {
  const audioRef = useRef(null)
  const loopRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.62)
  const activeAttraction = ATTRACTIONS.find((item) => item.id === activeId)

  function stopAudio() {
    window.clearInterval(loopRef.current)
    loopRef.current = null
    if (audioRef.current?.context) audioRef.current.context.close()
    audioRef.current = null
    setIsPlaying(false)
  }

  function startAttraction(attraction) {
    stopAudio()
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const context = new AudioContext()
    const output = context.createGain()
    output.gain.value = volume
    output.connect(context.destination)
    scheduleLoop(context, output, attraction, context.currentTime + 0.08)
    loopRef.current = window.setInterval(() => {
      scheduleLoop(context, output, attraction, context.currentTime + 0.08)
    }, LOOP_SECONDS * 1000)
    audioRef.current = { context, output }
    setActiveId(attraction.id)
    setIsPlaying(true)
  }

  async function togglePlayback() {
    const context = audioRef.current?.context
    if (!context) return
    if (context.state === 'running') {
      await context.suspend()
      setIsPlaying(false)
    } else {
      await context.resume()
      setIsPlaying(true)
    }
  }

  function changeVolume(event) {
    const nextVolume = Number(event.target.value)
    setVolume(nextVolume)
    if (audioRef.current?.output) audioRef.current.output.gain.value = nextVolume
  }

  function closePlayer() {
    stopAudio()
    setActiveId(null)
  }

  useEffect(() => {
    const previousTitle = document.title
    document.documentElement.classList.add('map-mode')
    document.title = 'Интерактивная карта Яковлевского района'

    return () => {
      window.clearInterval(loopRef.current)
      if (audioRef.current?.context) audioRef.current.context.close()
      document.documentElement.classList.remove('map-mode')
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="district-map">
      <header className="district-map__header">
        <h1>
          <span>Интерактивная карта</span>
          <strong>Яковлевского района</strong>
        </h1>
        <LandscapeMark />
      </header>

      <main className="district-map__canvas">
        <div className="district-map__stage">
          <DistrictOutline />
          {ATTRACTIONS.map((attraction) => {
            const Icon = attraction.icon
            const active = attraction.id === activeId
            return (
              <button
                className={`district-map__point${active ? ' is-active' : ''}`}
                key={attraction.id}
                style={attraction.position}
                type="button"
                aria-label={`Включить аудио: ${attraction.title}`}
                aria-pressed={active}
                onClick={() => startAttraction(attraction)}
              >
                <span className="district-map__point-icon"><Icon aria-hidden="true" /></span>
                <span className="district-map__point-label">{attraction.title}</span>
              </button>
            )
          })}
        </div>
      </main>

      <footer className="district-map__footer">
        <p>Сделано Школой креативных индустрий</p>
        <nav aria-label="Социальные сети">
          <a href="https://vk.com/shkistroitel" target="_blank" rel="noreferrer">
            <span className="district-map__vk" aria-hidden="true">VK</span>
            <span>VK</span>
          </a>
          <a href="https://web.max.ru/-69221720244297" target="_blank" rel="noreferrer">
            <span className="district-map__max" aria-hidden="true" />
            <span>MAX</span>
          </a>
        </nav>
      </footer>

      {activeAttraction && (
        <section className="district-map__player" aria-label="Аудиогид">
          <div className={`district-map__playing-mark${isPlaying ? ' is-playing' : ''}`} aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="district-map__track">
            <strong>{activeAttraction.title}</strong>
            <span>{isPlaying ? activeAttraction.caption : 'Воспроизведение приостановлено'}</span>
          </div>
          <button className="district-map__control" type="button" onClick={togglePlayback} aria-label={isPlaying ? 'Пауза' : 'Продолжить'}>
            {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <label className="district-map__volume">
            {volume === 0 ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
            <span className="sr-only">Громкость</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={changeVolume} />
          </label>
          <button className="district-map__control district-map__close" type="button" onClick={closePlayer} aria-label="Закрыть аудиогид">
            <X aria-hidden="true" />
          </button>
        </section>
      )}
    </div>
  )
}
