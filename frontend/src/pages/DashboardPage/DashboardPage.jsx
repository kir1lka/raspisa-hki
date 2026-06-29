import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CalendarDays, Building2, PartyPopper, ChevronDown } from 'lucide-react'
import Logo from '../../components/Logo/Logo'
import SearchBar from '../../components/SearchBar/SearchBar'
import SettingsModal from '../../components/SettingsModal/SettingsModal'
import AccountModal from '../../components/AccountModal/AccountModal'
import SchoolSchedule from '../../components/SchoolSchedule/SchoolSchedule'
import HolidaySchedule from '../../components/HolidaySchedule/HolidaySchedule'
import StudioEditor from '../../components/StudioEditor/StudioEditor'
import { ToastProvider } from '../../components/Toast/Toast'
import { fetchGroups, fetchTeachers } from '../../api'
import { getUser } from '../../auth'
import { useUiSettings } from '../../useUiSettings'

export default function DashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()
  const { theme, toggleTheme, zoom, setZoom } = useUiSettings()

  const [query, setQuery] = useState('')
  const [groups, setGroups] = useState([])
  const [teachers, setTeachers] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)

  const [accountOpen, setAccountOpen] = useState(() => !!location.state?.showAccount)

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dash-collapsed') || '{}')
    } catch {
      return {}
    }
  })
  const toggleSection = (id) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  useEffect(() => {
    localStorage.setItem('dash-collapsed', JSON.stringify(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (location.state?.showAccount) {
      navigate(location.pathname, { replace: true, state: null })
    }

  }, [])

  useEffect(() => {
    fetchGroups().then(setGroups).catch(() => setGroups([]))
    fetchTeachers().then(setTeachers).catch(() => setTeachers([]))
  }, [])

  return (
    <ToastProvider>
    <div className="flex min-h-[100dvh] flex-col">

      <div className="pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-[1140px] justify-center px-3 pt-4 pb-4 md:px-6 md:pt-6 md:pb-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <Logo to="/dashboard" />
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-[1140px] px-3 pb-3 md:px-6 md:pb-4 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
          <SearchBar
            query={query}
            onQueryChange={setQuery}
            groups={groups}
            teachers={teachers}
            onSelectGroup={(n) => navigate(`/dashboard/group/${n}`)}
            onSelectTeacher={(id) => navigate(`/dashboard/teacher/${id}`)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1140px] flex-1 px-3 pb-12 md:px-6 [zoom:calc(var(--ui-base)*var(--ui-zoom))]">
        <CollapsibleSection
          icon={CalendarDays}
          title="Общее расписание школы"
          collapsed={collapsed.schedule}
          onToggle={() => toggleSection('schedule')}
        >
          <SchoolSchedule />
        </CollapsibleSection>

        <CollapsibleSection
          icon={PartyPopper}
          title="Расписание мероприятий, праздников и каникул"
          collapsed={collapsed.holidays}
          onToggle={() => toggleSection('holidays')}
        >
          <HolidaySchedule />
        </CollapsibleSection>

        <CollapsibleSection
          icon={Building2}
          title="Редактирование студий"
          collapsed={collapsed.studios}
          onToggle={() => toggleSection('studios')}
        >
          <StudioEditor />
        </CollapsibleSection>
      </main>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} user={user} />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        zoom={zoom}
        onZoomChange={setZoom}
      />
    </div>
    </ToastProvider>
  )
}

function CollapsibleSection({ icon: Icon, title, collapsed, onToggle, children }) {
  return (
    <section className="mt-10 md:mt-14">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!collapsed}
        className="mb-3 flex w-full items-center gap-2 text-left text-3xl font-bold text-ink transition-colors hover:text-brand md:text-4xl"
      >
        <Icon className="size-8 shrink-0 text-brand" />
        <span className="flex-1">{title}</span>
        <ChevronDown className={'size-8 shrink-0 text-muted transition-transform ' + (collapsed ? '-rotate-90' : '')} />
      </button>
      <div className={collapsed ? 'hidden' : ''}>{children}</div>
    </section>
  )
}
