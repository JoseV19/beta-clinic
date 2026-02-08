import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Plus, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react'
import { useData } from '../context/DataContext'
import CalendarWidget from '../components/CalendarWidget'

/* ── Types ─────────────────────────────────────────────── */

interface Appointment {
  id: number
  paciente: string
  fecha: string          // YYYY-MM-DD
  hora: string           // HH:mm (24 h)
  duracion: number       // minutos
  tipo: string
  estado: 'confirmada' | 'pendiente'
}

/* ── Mock data ─────────────────────────────────────────── */

function getWeekDates(offset: number): string[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

function buildMockAppointments(dates: string[]): Appointment[] {
  const names = [
    'María García', 'Carlos López', 'Ana Torres',
    'Luis Ramírez', 'Sofía Mendoza', 'Jorge Castillo',
    'Valentina Ruiz', 'Andrés Morales', 'Camila Herrera',
    'Diego Vargas', 'Isabella Rojas', 'Mateo Ríos',
  ]
  const tipos = ['Consulta General', 'Control', 'Especialista', 'Laboratorio', 'Ecografía']

  let id = 1
  const list: Appointment[] = []

  const slots = ['08:00', '09:00', '09:30', '10:00', '11:00', '14:00', '15:00', '16:00']
  for (const fecha of dates) {
    const count = 2 + (id % 3)
    for (let j = 0; j < count; j++) {
      list.push({
        id: id++,
        paciente: names[(id * 3 + j) % names.length],
        fecha,
        hora: slots[(id + j) % slots.length],
        duracion: [30, 30, 60, 30][j % 4],
        tipo: tipos[(id + j) % tipos.length],
        estado: j % 3 === 0 ? 'pendiente' : 'confirmada',
      })
    }
  }

  return list
}

/* ── Helpers ───────────────────────────────────────────── */

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function formatDayHeader(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.getDate().toString()
}

function monthYearLabel(dates: string[]) {
  const first = new Date(dates[0] + 'T12:00:00')
  const last = new Date(dates[6] + 'T12:00:00')
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  if (first.getMonth() === last.getMonth()) return fmt(first)
  return `${first.toLocaleDateString('es-CO', { month: 'short' })} – ${fmt(last)}`
}

/* ── WhatsApp helper ───────────────────────────────────── */

function cleanPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('57') ? digits : '57' + digits
}

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────── */

export default function Agenda() {
  const { patients } = useData()
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [weekOffset, setWeekOffset] = useState(0)
  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const appointments = useMemo(() => buildMockAppointments(dates), [dates])

  function handleWhatsAppReminder(a: Appointment) {
    const patient = patients.find((p) => p.nombre === a.paciente)
    if (!patient) {
      toast.error('No se encontró el teléfono del paciente')
      return
    }
    const phone = cleanPhone(patient.telefono)
    const message = `Hola ${a.paciente.split(' ')[0]}, le saludamos de Beta Clinic para recordarle su cita mañana a las ${a.hora}. Por favor confirme su asistencia.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const byDayHour = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of appointments) {
      const hourKey = parseInt(a.hora.split(':')[0], 10)
      const key = `${a.fecha}-${hourKey}`
      const list = map.get(key) ?? []
      list.push(a)
      map.set(key, list)
    }
    return map
  }, [appointments])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Agenda</h1>
          <p className="mt-0.5 text-sm capitalize text-omega-dark/50 dark:text-clinical-white/40">
            {monthYearLabel(dates)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex overflow-hidden rounded-lg border border-omega-violet/20 dark:border-clinical-white/10">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'grid'
                  ? 'bg-omega-violet/10 text-omega-violet dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/50 hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5'
              }`}
            >
              <LayoutGrid size={13} />
              Grid
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 border-l border-omega-violet/20 px-3 py-1.5 text-xs font-semibold transition-colors dark:border-clinical-white/10 ${
                view === 'calendar'
                  ? 'bg-omega-violet/10 text-omega-violet dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/50 hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5'
              }`}
            >
              <CalendarIcon size={13} />
              Calendario
            </button>
          </div>

          {view === 'grid' && <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-omega-violet/20 px-3 py-1.5 text-xs font-medium text-omega-dark transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white dark:hover:bg-clinical-white/5"
          >
            Hoy
          </button>}
          {view === 'grid' && <>
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="rounded-lg border border-omega-violet/20 p-1.5 text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/60 dark:hover:bg-clinical-white/5"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="rounded-lg border border-omega-violet/20 p-1.5 text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/60 dark:hover:bg-clinical-white/5"
            >
              <ChevronRight size={18} />
            </button>
          </>}
        </div>
      </div>

      {/* Calendar widget (react-big-calendar) */}
      {view === 'calendar' && (
        <CalendarWidget />
      )}

      {/* Custom grid */}
      {view === 'grid' && (
        <div className="flex-1 overflow-auto rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className="w-16 border-b border-omega-violet/10 bg-omega-violet px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-clinical-white/80">
                  Hora
                </th>
                {dates.map((d, i) => {
                  const isToday = d === new Date().toISOString().split('T')[0]
                  return (
                    <th
                      key={d}
                      className="border-b border-l border-omega-violet/10 bg-omega-violet px-2 py-3 text-center font-semibold text-clinical-white"
                    >
                      <span className="block text-[10px] uppercase tracking-wider text-clinical-white/70">
                        {DAY_LABELS[i]}
                      </span>
                      <span
                        className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isToday ? 'bg-beta-mint text-omega-dark font-bold' : ''
                        }`}
                      >
                        {formatDayHeader(d)}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour} className="group">
                  <td className="border-b border-omega-violet/5 bg-clinical-white px-2 py-3 text-right align-top text-[11px] font-medium text-omega-dark/40 dark:border-clinical-white/5 dark:bg-omega-abyss dark:text-clinical-white/30">
                    {hour.toString().padStart(2, '0')}:00
                  </td>
                  {dates.map((date) => {
                    const key = `${date}-${hour}`
                    const items = byDayHour.get(key) ?? []
                    return (
                      <td
                        key={key}
                        className="h-16 border-b border-l border-omega-violet/5 p-1 align-top transition-colors hover:bg-omega-violet/[0.02] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                      >
                        {items.map((a) => (
                          <div
                            key={a.id}
                            className={`group/card relative mb-1 cursor-default rounded-md px-1.5 py-1 leading-tight ${
                              a.estado === 'confirmada'
                                ? 'bg-beta-mint/20 text-emerald-800 dark:text-beta-mint'
                                : 'bg-gray-100 text-gray-600 dark:bg-clinical-white/10 dark:text-clinical-white/60'
                            }`}
                          >
                            <span className="block truncate pr-5 font-semibold">
                              {a.paciente}
                            </span>
                            <span className="block truncate text-[10px] opacity-70">
                              {a.hora} · {a.tipo}
                            </span>
                            <button
                              onClick={() => handleWhatsAppReminder(a)}
                              title="Recordatorio por WhatsApp"
                              className="absolute right-1 top-1 rounded p-0.5 text-[#25D366] opacity-0 transition-opacity hover:bg-black/10 group-hover/card:opacity-100"
                            >
                              <WaIcon size={12} />
                            </button>
                          </div>
                        ))}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FAB — Nueva Cita */}
      <button
        onClick={() => toast.success('Cita agendada correctamente')}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-omega-violet px-5 py-3 font-semibold text-clinical-white shadow-lg shadow-omega-violet/30 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={20} strokeWidth={2.5} />
        <span className="hidden sm:inline">Nueva Cita</span>
      </button>
    </div>
  )
}
