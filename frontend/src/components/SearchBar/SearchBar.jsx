import { useState } from 'react'
import { Search, Settings, X, Users, User } from 'lucide-react'

export default function SearchBar({
  query,
  onQueryChange,
  groups = [],
  teachers = [],
  onSelectGroup,
  onSelectTeacher,
  onOpenSettings,
}) {
  const [open, setOpen] = useState(false)

  const q = String(query).trim()
  const hasLetters = /[A-Za-zА-Яа-яЁё]/.test(q)

  let suggestions = []
  if (hasLetters) {
    const lq = q.toLowerCase()
    suggestions = teachers
      .filter((t) => t.fullName.toLowerCase().includes(lq))
      .slice(0, 13)
      .map((t) => ({
        key: `t${t.id}`,
        icon: User,
        label: t.fullName,
        run: () => onSelectTeacher?.(t.id),
      }))
  } else {
    const digits = q.replace(/\D/g, '')
    suggestions = groups
      .filter((n) => digits === '' || String(n).startsWith(digits))
      .slice(0, 13)
      .map((n) => ({
        key: `g${n}`,
        icon: Users,
        label: `${n} группа`,
        run: () => onSelectGroup?.(n),
      }))
  }
  const showList = open && suggestions.length > 0

  const iconBtn =
    'flex h-14 w-14 shrink-0 items-center justify-center rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface text-muted transition hover:border-brand hover:text-brand focus:border-brand focus:text-brand active:scale-95 active:border-brand active:text-brand md:h-20 md:w-20'

  function pick(item) {
    item.run()
    setOpen(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setOpen(false)
    if (!hasLetters) {
      const n = parseInt(q, 10)
      if (n) onSelectGroup?.(n)
    } else if (suggestions.length === 1) {
      suggestions[0].run()
    }
  }

  return (
    <header className="flex items-center gap-2 md:gap-3">
      <div className="relative min-w-0 flex-1">
        <form
          onSubmit={handleSubmit}
          className="flex h-14 w-full items-center gap-3 rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface px-5 transition-colors hover:border-brand focus-within:border-brand md:h-20"
        >
          <Search className="size-7 shrink-0 text-muted md:size-11" strokeWidth={2.5} />
          <input
            className={
              'min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-muted/70 md:text-3xl ' +
              (open ? 'text-ink' : 'text-muted')
            }
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            placeholder="Введите № группы"
          />
          {String(query).length > 0 && (
            <button
              type="button"
              title="Очистить"
              aria-label="Очистить поиск"
              onMouseDown={(e) => {
                e.preventDefault()
                onQueryChange('')
              }}
              className="grid size-9 shrink-0 place-items-center rounded-md bg-canvas text-red-400 transition-colors hover:text-red-500 md:size-12"
            >
              <X className="size-5 md:size-8" strokeWidth={2.5} />
            </button>
          )}
        </form>

        {showList && (
          <ul className="absolute top-full right-0 left-0 z-30 mt-2 max-h-80 animate-fade-in overflow-auto rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface shadow-lg">
            {suggestions.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.key} className="border-line/60 [&:not(:last-child)]:border-b">
                  <button
                    type="button"
                    onMouseDown={() => pick(item)}
                    className="flex h-14 w-full items-center gap-3 px-5 text-left text-lg text-ink transition-colors hover:bg-canvas md:h-20 md:text-2xl"
                  >
                    <Icon className="size-5 shrink-0 text-muted md:size-7" strokeWidth={2.5} />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <button type="button" className={iconBtn} title="Настройки" onClick={onOpenSettings}>
        <Settings className="size-8 md:size-12" strokeWidth={2.5} />
      </button>
    </header>
  )
}
