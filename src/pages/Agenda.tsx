import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

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

/* ── Component ─────────────────────────────────────────── */

export default function Agenda() {
  const [weekOffset, setWeekOffset] = useState(0)
  const dates = useMemo(() => getWeekDates(weekOffset), [weekOffset])
  const appointments = useMemo(() => buildMockAppointments(dates), [dates])

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
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-lg border border-omega-violet/20 px-3 py-1.5 text-xs font-medium text-omega-dark transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white dark:hover:bg-clinical-white/5"
          >
            Hoy
          </button>
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
        </div>
      </div>

      {/* Calendar grid */}
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
                          className={`mb-1 cursor-default rounded-md px-1.5 py-1 leading-tight ${
                            a.estado === 'confirmada'
                              ? 'bg-beta-mint/20 text-emerald-800 dark:text-beta-mint'
                              : 'bg-gray-100 text-gray-600 dark:bg-clinical-white/10 dark:text-clinical-white/60'
                          }`}
                        >
                          <span className="block truncate font-semibold">
                            {a.paciente}
                          </span>
                          <span className="block truncate text-[10px] opacity-70">
                            {a.hora} · {a.tipo}
                          </span>
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

      {/* FAB — Nueva Cita */}
      <button className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-omega-violet px-5 py-3 font-semibold text-clinical-white shadow-lg shadow-omega-violet/30 transition-transform hover:scale-105 active:scale-95">
        <Plus size={20} strokeWidth={2.5} />
        <span className="hidden sm:inline">Nueva Cita</span>
      </button>
    </div>
  )
}
