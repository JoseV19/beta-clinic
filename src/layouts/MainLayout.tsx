import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  DollarSign,
  Video,
  FileBarChart,
  Contact,
  ClipboardPlus,
  FlaskConical,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/consultas', label: 'Consultas', icon: Stethoscope },
  { to: '/finanzas', label: 'Finanzas', icon: DollarSign },
  { to: '/telemedicina', label: 'Telemedicina', icon: Video },
  { to: '/reportes-rips', label: 'Reportes RIPS', icon: FileBarChart },
  { to: '/recetas', label: 'Recetas', icon: ClipboardPlus },
  { to: '/laboratorios', label: 'Laboratorios', icon: FlaskConical },
  { to: '/directorio', label: 'Directorio', icon: Contact },
]

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-clinical-white dark:bg-omega-abyss">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-omega-dark
          transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5">
          <img
            src="/beta-logo.png"
            alt="Beta Clinic"
            className="h-9 w-auto object-contain"
          />
          <button
            className="text-clinical-white/70 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-beta-mint/15 text-beta-mint shadow-[inset_3px_0_0_0] shadow-beta-mint'
                    : 'text-clinical-white/70 hover:bg-clinical-white/10 hover:text-clinical-white'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle + Logout */}
        <div className="space-y-1 px-3 pb-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-clinical-white/70 transition-colors hover:bg-clinical-white/10 hover:text-clinical-white"
          >
            {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-alert-red/70 transition-colors hover:bg-alert-red/10 hover:text-alert-red"
          >
            <LogOut size={20} strokeWidth={1.75} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="flex h-14 items-center border-b border-gray-200 bg-clinical-white px-4 dark:border-clinical-white/10 dark:bg-omega-abyss md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-omega-dark dark:text-clinical-white" />
          </button>
          <img src="/beta-logo.png" alt="Beta Clinic" className="ml-3 h-7 w-auto object-contain" />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggleTheme} className="text-omega-dark/60 dark:text-clinical-white/60">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => navigate('/')} className="text-alert-red/60 transition-colors hover:text-alert-red">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-clinical-white p-6 dark:bg-omega-abyss">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
