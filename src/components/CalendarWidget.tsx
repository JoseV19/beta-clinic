import { useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, setHours, setMinutes, addMinutes } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { toast } from 'sonner'
import type { AgendaAppointment } from '../types/phase2'

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

interface CalendarEvent {
  id: number
  title: string
  start: Date
  end: Date
  type: string
  doctor: string
  appointment: AgendaAppointment
}

/* ── Color map ────────────────────────────────────────── */

const EVENT_COLORS: Record<string, string> = {
  consulta: '#3B82F6',
  urgencia: '#EF4444',
  control: '#10B981',
  laboratorio: '#F59E0B',
  especialista: '#8B5CF6',
}

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
  appointments: AgendaAppointment[]
  onSelectAppointment?: (a: AgendaAppointment) => void
  defaultView?: View
}

export default function CalendarWidget({ appointments, onSelectAppointment, defaultView = 'week' }: Props) {
  const events = useMemo<CalendarEvent[]>(() =>
    appointments.map((a) => {
      const [h, m] = a.hora.split(':').map(Number)
      const dateStr = a.fecha + 'T12:00:00'
      const base = new Date(dateStr)
      base.setHours(h, m, 0, 0)
      const start = new Date(base)
      const end = addMinutes(start, a.duracion || 30)

      return {
        id: a.id,
        title: `${a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)} - ${a.patientName}`,
        start,
        end,
        type: a.tipo,
        doctor: a.doctor,
        appointment: a,
      }
    }),
    [appointments],
  )

  const eventPropGetter = useCallback((event: CalendarEvent) => ({
    style: {
      backgroundColor: EVENT_COLORS[event.type] ?? '#3B82F6',
      color: '#fff',
    },
  }), [])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (onSelectAppointment) {
      onSelectAppointment(event.appointment)
    } else {
      toast.success(
        `${event.title}\n${format(event.start, 'HH:mm')} – ${format(event.end, 'HH:mm')}\nDoctor: ${event.doctor}`,
      )
    }
  }, [onSelectAppointment])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const hora = format(start, 'HH:mm')
    const fecha = format(start, 'dd/MM/yyyy')
    toast.success(`Nueva cita: ${fecha} a las ${hora}`)
  }, [])

  const minTime = useMemo(() => setMinutes(setHours(new Date(), 7), 0), [])
  const maxTime = useMemo(() => setMinutes(setHours(new Date(), 20), 0), [])

  return (
    <div className="h-[calc(100vh-180px)] min-h-[500px]">
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={events}
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
            `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`,
          timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
          eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
        }}
      />
    </div>
  )
}
