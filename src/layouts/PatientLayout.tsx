import { NavLink, Outlet } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Home, CalendarPlus, Pill, UserCircle } from 'lucide-react'

const navItems: { to: string; label: string; icon: typeof Home; end?: boolean }[] = [
  { to: '/portal', label: 'Inicio', icon: Home, end: true },
  { to: '/portal/agendar', label: 'Agendar', icon: CalendarPlus },
  { to: '/portal/recetas', label: 'Recetas', icon: Pill },
  { to: '/portal/perfil', label: 'Perfil', icon: UserCircle },
]

export default function PatientLayout() {
  const { user } = useUser()
  const firstName = user?.firstName || 'Paciente'

  return (
    <div className="flex min-h-dvh justify-center bg-zinc-950">
      {/* Mobile app container */}
      <div className="flex w-full max-w-md flex-col bg-zinc-900">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/beta-logo.png" alt="Beta Life" className="h-7 w-auto object-contain" />
            <div className="h-4 w-px bg-zinc-700" />
            <span className="text-xs font-bold tracking-wider text-zinc-500">BETA LIFE</span>
          </div>
          <p className="text-sm text-zinc-400">
            Hola, <span className="font-semibold text-beta-mint">{firstName}</span>
          </p>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 pb-24 pt-5">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
          <div className="flex items-center justify-around px-2 pb-1 pt-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[10px] font-semibold transition-colors ${
                    isActive
                      ? 'text-beta-mint'
                      : 'text-zinc-500 active:text-zinc-300'
                  }`
                }
              >
                <Icon size={22} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
