import type { IconName, Screen, UserSummary } from '@/models/types'
import { Icon } from './Icon'
import { Logo } from './Logo'

export function AppHeader({
  screen,
  onNavigate,
  onLogout,
  profileOpen,
  setProfileOpen,
  user,
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
  onLogout: () => void
  profileOpen: boolean
  setProfileOpen: (value: boolean) => void
  user: UserSummary | null
}) {
  const links: [Screen, string][] = [
    ['reports', 'Reportes'],
    ['map', 'Mapa'],
    ['new', 'Nuevo reporte'],
    ['mine', 'Mis reportes'],
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate('reports')} aria-label="Ir a reportes">
          <Logo />
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`min-h-11 rounded-xl px-4 text-sm font-bold transition ${
                screen === id
                  ? 'bg-violet-50 text-violet-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-violet-900'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 pr-2 text-sm font-bold text-violet-950 hover:bg-violet-50"
            aria-label="Abrir menú de perfil"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#f3e8ff] text-violet-800">
              <Icon name="user" size={17} />
            </span>
            <span className="hidden sm:inline">{user?.name || 'Mi cuenta'}</span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-[52px] w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Mi cuenta'}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  onNavigate('profile')
                  setProfileOpen(false)
                }}
                className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Icon name="user" size={17} /> Mi perfil
              </button>
              <button
                onClick={onLogout}
                className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Icon name="arrow" size={17} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function BottomNav({
  screen,
  onNavigate,
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
}) {
  const items: { id: Screen; label: string; icon: IconName }[] = [
    { id: 'reports', label: 'Reportes', icon: 'reports' },
    { id: 'map', label: 'Mapa', icon: 'map' },
    { id: 'new', label: 'Nuevo reporte', icon: 'plus' },
    { id: 'mine', label: 'Mis reportes', icon: 'reports' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold ${
              screen === item.id ? 'bg-violet-50 text-violet-900' : 'text-slate-500'
            }`}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
