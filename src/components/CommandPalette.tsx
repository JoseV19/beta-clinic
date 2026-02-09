import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  FileBarChart,
  Search,
  Settings,
  DollarSign,
  BarChart3,
  Video,
  Package,
  ClipboardCheck,
  Contact,
  Bell,
} from 'lucide-react'
import { useData } from '../context/DataContext'

/* ── Navigation items ──────────────────────────────────── */

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Agenda', path: '/agenda', icon: CalendarDays },
  { label: 'Pacientes', path: '/pacientes', icon: Users },
  { label: 'Consultas', path: '/consultas', icon: Stethoscope },
  { label: 'Facturación', path: '/facturacion', icon: DollarSign },
  { label: 'Reportes', path: '/reportes', icon: BarChart3 },
  { label: 'Telemedicina', path: '/telemedicina', icon: Video },
  { label: 'Recordatorios', path: '/recordatorios', icon: Bell },
  { label: 'Inventario', path: '/inventario', icon: Package },
  { label: 'Tareas', path: '/tareas', icon: ClipboardCheck },
  { label: 'Directorio', path: '/directorio', icon: Contact },
  { label: 'Configuración', path: '/configuracion', icon: Settings },
  { label: 'Reportes RIPS', path: '/reportes-rips', icon: FileBarChart },
]

/* ── Component ──────────────────────────────────────────── */

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { patients, appointments, invoices } = useData()

  /* ── Keyboard shortcut ──────────────────────────────── */

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  /* ── Upcoming appointments (next 5) ─────────────────── */

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return appointments
      .filter(a => a.fecha >= today && a.estado !== 'cancelada')
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
      .slice(0, 5)
  }, [appointments])

  /* ── Recent invoices (last 5) ───────────────────────── */

  const recentInvoices = useMemo(
    () => invoices.slice(0, 5),
    [invoices],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="flex items-start justify-center pt-[15vh]">
        <Command
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-clinical-white/10 bg-omega-surface shadow-2xl"
          label="Búsqueda rápida"
        >
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-clinical-white/[0.06] px-4">
            <Search size={18} className="shrink-0 text-clinical-white/30" />
            <Command.Input
              autoFocus
              placeholder="Buscar pacientes, páginas, citas..."
              className="w-full bg-transparent py-3.5 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30"
            />
            <kbd className="shrink-0 rounded-md border border-clinical-white/10 bg-clinical-white/5 px-1.5 py-0.5 text-[10px] font-medium text-clinical-white/30">
              Esc
            </kbd>
          </div>

          {/* List */}
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-clinical-white/30">
              Sin resultados
            </Command.Empty>

            {/* Navigation */}
            <Command.Group
              heading={
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-clinical-white/25">
                  Navegación
                </span>
              }
            >
              {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
                <Command.Item
                  key={path}
                  value={label}
                  onSelect={() => {
                    navigate(path)
                    setOpen(false)
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-clinical-white/70 transition-colors data-[selected=true]:bg-omega-violet/15 data-[selected=true]:text-clinical-white"
                >
                  <Icon size={16} className="shrink-0 text-clinical-white/30" />
                  {label}
                </Command.Item>
              ))}
            </Command.Group>

            {/* Patients */}
            {patients.length > 0 && (
              <Command.Group
                heading={
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-clinical-white/25">
                    Pacientes
                  </span>
                }
              >
                {patients.map(p => (
                  <Command.Item
                    key={`patient-${p.id}`}
                    value={`${p.nombre} ${p.documento ?? ''}`}
                    onSelect={() => {
                      navigate(`/pacientes/${p.id}`)
                      setOpen(false)
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-clinical-white/70 transition-colors data-[selected=true]:bg-omega-violet/15 data-[selected=true]:text-clinical-white"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-omega-violet/15 text-[10px] font-bold text-omega-violet dark:text-beta-mint">
                      {p.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{p.nombre}</p>
                      {p.documento && (
                        <p className="text-[11px] text-clinical-white/30">{p.documento}</p>
                      )}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Upcoming appointments */}
            {upcomingAppointments.length > 0 && (
              <Command.Group
                heading={
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-clinical-white/25">
                    Próximas Citas
                  </span>
                }
              >
                {upcomingAppointments.map(a => (
                  <Command.Item
                    key={`appt-${a.id}`}
                    value={`cita ${a.patientName} ${a.fecha} ${a.hora}`}
                    onSelect={() => {
                      navigate('/agenda')
                      setOpen(false)
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-clinical-white/70 transition-colors data-[selected=true]:bg-omega-violet/15 data-[selected=true]:text-clinical-white"
                  >
                    <CalendarDays size={16} className="shrink-0 text-clinical-white/30" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{a.patientName}</p>
                      <p className="text-[11px] text-clinical-white/30">{a.fecha} · {a.hora} · {a.doctor}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Recent invoices */}
            {recentInvoices.length > 0 && (
              <Command.Group
                heading={
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-clinical-white/25">
                    Facturas Recientes
                  </span>
                }
              >
                {recentInvoices.map(i => (
                  <Command.Item
                    key={`inv-${i.id}`}
                    value={`factura ${i.numero} ${i.pacienteNombre ?? ''}`}
                    onSelect={() => {
                      navigate('/facturacion')
                      setOpen(false)
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-clinical-white/70 transition-colors data-[selected=true]:bg-omega-violet/15 data-[selected=true]:text-clinical-white"
                  >
                    <DollarSign size={16} className="shrink-0 text-clinical-white/30" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{i.numero} — {i.pacienteNombre ?? 'Sin nombre'}</p>
                      <p className="text-[11px] text-clinical-white/30">${i.total.toLocaleString()} · {i.estado}</p>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-clinical-white/[0.06] px-4 py-2.5">
            <span className="text-[10px] text-clinical-white/20">
              Esc para cerrar · Enter para seleccionar
            </span>
            <span className="text-[10px] text-clinical-white/20">Beta Clinic</span>
          </div>
        </Command>
      </div>
    </div>
  )
}
