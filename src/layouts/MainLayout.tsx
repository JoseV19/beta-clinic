import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
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
  Package,
  ClipboardCheck,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  SmilePlus,
  TrendingUp,
  Syringe,
  Baby,
  Apple,
  ChevronDown,
  Calculator,
  UtensilsCrossed,
  Bell,
  Contrast,
  Search,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useTheme } from '../context/ThemeContext'
import { useClinic, type ClinicType } from '../context/ClinicContext'
import BetaAssistant from '../components/BetaAssistant'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import CommandPalette from '../components/CommandPalette'
import NotificationCenter from '../components/NotificationCenter'
import { useNotificationGenerator } from '../hooks/useNotificationGenerator'

/* ── Nav item type ───────────────────────────────────── */

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

/* ── Base items (all clinic types) ───────────────────── */

const baseItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agenda', label: 'Agenda', icon: CalendarDays },
  { to: '/pacientes', label: 'Pacientes', icon: Users },

]

/* ── Specialty-specific items ────────────────────────── */

const specialtyItems: Record<ClinicType, NavItem[]> = {
  general: [
    { to: '/consultas', label: 'Consultas', icon: Stethoscope },
    { to: '/recetas', label: 'Recetas', icon: ClipboardPlus },
    { to: '/laboratorios', label: 'Laboratorios', icon: FlaskConical },
  ],
  dental: [
    { to: '/odontograma', label: 'Odontograma', icon: SmilePlus },
    { to: '/presupuestos', label: 'Presupuestos', icon: DollarSign },
    { to: '/lab-dental', label: 'Lab Tracker', icon: Package },
  ],
  pediatrics: [
    { to: '/crecimiento', label: 'Crecimiento', icon: TrendingUp },
    { to: '/vacunacion', label: 'Vacunación', icon: Syringe },
  ],
  nutrition: [
    { to: '/calculadora', label: 'Calculadora IMC', icon: Calculator },
    { to: '/planificador', label: 'Planificador Dieta', icon: UtensilsCrossed },
  ],
}

/* ── Quick-switch options ──────────────────────────── */

const QUICK_SWITCH: { type: ClinicType; label: string; icon: LucideIcon }[] = [
  { type: 'general', label: 'Medicina General', icon: Stethoscope },
  { type: 'dental', label: 'Odontología', icon: SmilePlus },
  { type: 'pediatrics', label: 'Pediatría', icon: Baby },
  { type: 'nutrition', label: 'Nutrición', icon: Apple },
]

/* ── Shared items (all clinic types, after specialty) ── */

const sharedItems: NavItem[] = [
  { to: '/facturacion', label: 'Facturación', icon: FileBarChart },
  { to: '/reportes', label: 'Reportes', icon: TrendingUp },
  { to: '/telemedicina', label: 'Telemedicina', icon: Video },
  { to: '/recordatorios', label: 'Recordatorios', icon: Bell },
  { to: '/reportes-rips', label: 'Reportes RIPS', icon: FileBarChart },
  { to: '/inventario', label: 'Inventario', icon: Package },
  { to: '/tareas', label: 'Tareas', icon: ClipboardCheck },
  { to: '/directorio', label: 'Directorio', icon: Contact },
  { to: '/portal-paciente', label: 'Portal Paciente', icon: Smartphone },
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]

/* ── Component ───────────────────────────────────────── */

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [switchOpen, setSwitchOpen] = useState(false)
  const switchRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme, monochrome, toggleMonochrome } = useTheme()
  const { clinicType, setClinicType } = useClinic()

  // Auto-generate notifications
  useNotificationGenerator()

  // Close dropdown on outside click
  useEffect(() => {
    if (!switchOpen) return
    function handleClick(e: MouseEvent) {
      if (switchRef.current && !switchRef.current.contains(e.target as Node)) {
        setSwitchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [switchOpen])

  function handleQuickSwitch(type: ClinicType) {
    setSwitchOpen(false)
    if (type === clinicType) return
    setClinicType(type)
    const label = QUICK_SWITCH.find(s => s.type === type)?.label ?? type
    toast.success(`Cambiando a protocolo ${label}...`)
    setTimeout(() => window.location.reload(), 1000)
  }

  const navItems = useMemo(() => {
    const specific = specialtyItems[clinicType ?? 'general'] ?? []
    return [...baseItems, ...specific, ...sharedItems]
  }, [clinicType])

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

        {/* Specialty badge — quick switch */}
        {clinicType && (
          <div ref={switchRef} className="relative mx-3 mb-2">
            <button
              onClick={() => setSwitchOpen(o => !o)}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-beta-mint/10 px-3 py-1.5 transition-colors hover:bg-beta-mint/15"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-beta-mint">
                {QUICK_SWITCH.find(s => s.type === clinicType)?.label}
              </span>
              <ChevronDown
                size={12}
                className={`text-beta-mint/60 transition-transform duration-200 ${switchOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {switchOpen && (
              <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-lg border border-clinical-white/10 bg-omega-dark shadow-xl">
                {QUICK_SWITCH.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => handleQuickSwitch(type)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                      type === clinicType
                        ? 'bg-beta-mint/15 text-beta-mint'
                        : 'text-clinical-white/70 hover:bg-clinical-white/5 hover:text-clinical-white'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
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

        {/* ⌘K hint */}
        <div className="mx-3 mb-2">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex w-full items-center justify-between rounded-lg border border-clinical-white/[0.06] bg-clinical-white/[0.03] px-3 py-2 text-xs text-clinical-white/40 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white/60"
          >
            <div className="flex items-center gap-2">
              <Search size={14} />
              <span>Buscar...</span>
            </div>
            <kbd className="rounded border border-clinical-white/10 bg-clinical-white/5 px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
          </button>
        </div>

        {/* Theme toggle + User */}
        <div className="space-y-3 px-3 pb-4">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-clinical-white/70 transition-colors hover:bg-clinical-white/10 hover:text-clinical-white"
          >
            {theme === 'dark' ? <Sun size={20} strokeWidth={1.75} /> : <Moon size={20} strokeWidth={1.75} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button
            onClick={toggleMonochrome}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              monochrome
                ? 'bg-clinical-white/15 text-clinical-white'
                : 'text-clinical-white/70 hover:bg-clinical-white/10 hover:text-clinical-white'
            }`}
          >
            <Contrast size={20} strokeWidth={1.75} />
            {monochrome ? 'Modo Color' : 'Monocromático'}
          </button>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <NotificationCenter />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
            <span className="text-sm font-medium text-clinical-white/70">Mi Cuenta</span>
          </div>
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
            <NotificationCenter />
            <button onClick={toggleMonochrome} className={`transition-colors ${monochrome ? 'text-omega-dark dark:text-clinical-white' : 'text-omega-dark/60 dark:text-clinical-white/60'}`}>
              <Contrast size={18} />
            </button>
            <button onClick={toggleTheme} className="text-omega-dark/60 dark:text-clinical-white/60">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-7 w-7',
                },
              }}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-clinical-white p-6 dark:bg-omega-abyss">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        <BetaAssistant />

        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1030',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F8F9FA',
            },
            classNames: {
              success: '[&>[data-icon]]:text-beta-mint',
              error: '[&>[data-icon]]:text-alert-red',
            },
          }}
        />
      </div>

      <CommandPalette />
    </div>
  )
}
