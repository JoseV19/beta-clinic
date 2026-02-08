import { useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addHours, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { toast } from 'sonner'

import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-omega.css'

/* ── Localizer (español) ──────────────────────────────── */

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

/* ── Event types ──────────────────────────────────────── */

export interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  type: 'consulta' | 'urgencia' | 'control' | 'laboratorio'
  doctor: string
}

/* ── Color map ────────────────────────────────────────── */

const EVENT_COLORS: Record<CalendarEvent['type'], string> = {
  consulta: '#3B82F6',    // blue
  urgencia: '#EF4444',    // red
  control: '#10B981',     // green
  laboratorio: '#F59E0B', // amber
}

/* ── Mock data ────────────────────────────────────────── */

function buildDate(dayOffset: number, hour: number, minute = 0): Date {
  const today = new Date()
  const d = new Date(today)
  d.setDate(today.getDate() + dayOffset)
  return setMinutes(setHours(d, hour), minute)
}

const mockAppointments: CalendarEvent[] = [
  { id: 1,  title: 'Consulta - María García',      start: buildDate(0, 9),    end: buildDate(0, 9, 30),   type: 'consulta',    doctor: 'Dr. Valiente' },
  { id: 2,  title: 'Urgencia - Carlos López',       start: buildDate(0, 10),   end: buildDate(0, 10, 45),  type: 'urgencia',    doctor: 'Dr. Valiente' },
  { id: 3,  title: 'Control - Ana Torres',          start: buildDate(0, 14),   end: buildDate(0, 14, 30),  type: 'control',     doctor: 'Dra. Mendoza' },
  { id: 4,  title: 'Laboratorio - Luis Ramírez',    start: buildDate(1, 8),    end: buildDate(1, 8, 30),   type: 'laboratorio', doctor: 'Dr. Valiente' },
  { id: 5,  title: 'Consulta - Sofía Mendoza',      start: buildDate(1, 11),   end: buildDate(1, 11, 30),  type: 'consulta',    doctor: 'Dra. Mendoza' },
  { id: 6,  title: 'Control - Jorge Castillo',      start: buildDate(1, 15),   end: buildDate(1, 15, 30),  type: 'control',     doctor: 'Dr. Valiente' },
  { id: 7,  title: 'Consulta - Valentina Ruiz',     start: buildDate(2, 9),    end: buildDate(2, 9, 30),   type: 'consulta',    doctor: 'Dra. Mendoza' },
  { id: 8,  title: 'Urgencia - Andrés Morales',     start: buildDate(2, 12),   end: buildDate(2, 12, 30),  type: 'urgencia',    doctor: 'Dr. Valiente' },
  { id: 9,  title: 'Consulta - Camila Herrera',     start: buildDate(-1, 10),  end: buildDate(-1, 10, 30), type: 'consulta',    doctor: 'Dra. Mendoza' },
  { id: 10, title: 'Control - Diego Vargas',        start: buildDate(-1, 16),  end: buildDate(-1, 16, 30), type: 'control',     doctor: 'Dr. Valiente' },
  { id: 11, title: 'Consulta - Isabella Rojas',     start: buildDate(3, 9),    end: buildDate(3, 9, 30),   type: 'consulta',    doctor: 'Dr. Valiente' },
  { id: 12, title: 'Laboratorio - Mateo Ríos',      start: buildDate(3, 14),   end: buildDate(3, 14, 30),  type: 'laboratorio', doctor: 'Dra. Mendoza' },
]

/* ── Messages (español) ───────────────────────────────── */

const messages = {
  today: 'Hoy',
  previous: 'Anterior',
  next: 'Siguiente',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Cita',
  noEventsInRange: 'Sin citas en este rango.',
  showMore: (total: number) => `+${total} más`,
}

/* ── Component ─────────────────────────────────────────── */

interface Props {
  defaultView?: View
}

export default function CalendarWidget({ defaultView = 'week' }: Props) {
  /* Event styles by type */
  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: EVENT_COLORS[event.type] ?? '#3B82F6',
      color: '#fff',
    },
  }), [])

  /* Click on event */
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    toast.success(
      `${event.title}\n${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}\nDoctor: ${event.doctor}`,
    )
  }, [])

  /* Click on empty slot */
  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const hora = format(start, 'HH:mm')
    const fecha = format(start, 'dd/MM/yyyy')
    toast.success(`Nueva cita: ${fecha} a las ${hora}`)
  }, [])

  /* Min/max hours for week/day view */
  const minTime = useMemo(() => setMinutes(setHours(new Date(), 7), 0), [])
  const maxTime = useMemo(() => setMinutes(setHours(new Date(), 20), 0), [])

  return (
    <div className="h-[calc(100vh-180px)] min-h-[500px]">
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={mockAppointments}
        defaultView={defaultView}
        views={['month', 'week', 'day', 'agenda']}
        messages={messages}
        culture="es"
        min={minTime}
        max={maxTime}
        step={30}
        timeslots={1}
        selectable
        popup
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        formats={{
          dayHeaderFormat: (date: Date) => format(date, "EEEE d 'de' MMMM", { locale: es }),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, "d MMM", { locale: es })} – ${format(end, "d MMM yyyy", { locale: es })}`,
          timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
        }}
      />
    </div>
  )
}
