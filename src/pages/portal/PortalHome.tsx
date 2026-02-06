import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  Phone,
  FileText,
  MapPin,
  Stethoscope,
  Clock,
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

/* ── Countdown hook ───────────────────────────────────── */

function useCountdown(targetMs: number) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const diff = targetMs - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    passed: false,
  }
}

/* ── Mock next appointment (always 2 days from now) ──── */

function getNextAppointment() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  date.setHours(9, 30, 0, 0)
  const formatted = date.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return {
    doctor: 'Dr. Rodríguez',
    especialidad: 'Medicina General',
    fechaDisplay: formatted.charAt(0).toUpperCase() + formatted.slice(1),
    hora: '09:30 AM',
    lugar: 'Consultorio 3',
    targetMs: date.getTime(),
  }
}

const appointment = getNextAppointment()

/* ── Component ────────────────────────────────────────── */

export default function PortalHome() {
  const { clinic } = useSettings()
  const countdown = useCountdown(appointment.targetMs)

  const quickActions = [
    {
      label: 'Llamar a Clínica',
      icon: Phone,
      color: 'bg-emerald-500/15 text-emerald-400',
      action: () => window.open(`tel:${clinic.telefono.replace(/\D/g, '')}`, '_self'),
    },
    {
      label: 'Mis Resultados',
      icon: FileText,
      color: 'bg-blue-500/15 text-blue-400',
      action: () => {},
      to: '/portal/recetas',
    },
    {
      label: 'Ubicación',
      icon: MapPin,
      color: 'bg-amber-500/15 text-amber-400',
      action: () =>
        window.open(
          `https://maps.google.com/?q=${encodeURIComponent(clinic.direccion)}`,
          '_blank',
        ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Next Appointment Card */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/50">
        <div className="flex items-center gap-2 border-b border-zinc-700/50 px-4 py-3">
          <CalendarClock size={16} className="text-beta-mint" />
          <h2 className="text-sm font-bold text-zinc-200">Tu Próxima Cita</h2>
        </div>

        <div className="p-4">
          {/* Doctor info */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-beta-mint/15">
              <Stethoscope size={20} className="text-beta-mint" />
            </div>
            <div>
              <p className="font-semibold text-zinc-100">{appointment.doctor}</p>
              <p className="text-xs text-zinc-400">{appointment.especialidad}</p>
            </div>
          </div>

          {/* Date & place */}
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <CalendarClock size={13} />
              {appointment.fechaDisplay} · {appointment.hora}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {appointment.lugar}
            </span>
          </div>

          {/* Countdown */}
          {!countdown.passed && (
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                <Clock size={12} />
                Cuenta regresiva
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: countdown.days, label: 'Días' },
                  { value: countdown.hours, label: 'Horas' },
                  { value: countdown.minutes, label: 'Min' },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-zinc-900 py-2.5 text-center"
                  >
                    <p className="text-2xl font-bold tabular-nums text-beta-mint">{value}</p>
                    <p className="text-[10px] font-medium text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {countdown.passed && (
            <div className="mt-4">
              <Link
                to="/portal/agendar"
                className="block rounded-xl bg-beta-mint py-3 text-center text-sm font-bold text-zinc-900 transition-colors active:bg-beta-mint/80"
              >
                Reservar Nueva Cita
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ label, icon: Icon, color, action, to }) => {
            const content = (
              <>
                <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-[11px] font-medium leading-tight text-zinc-300">{label}</span>
              </>
            )

            if (to) {
              return (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/30 px-2 py-4 text-center transition-colors active:bg-zinc-800"
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={label}
                onClick={action}
                className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-800/30 px-2 py-4 text-center transition-colors active:bg-zinc-800"
              >
                {content}
              </button>
            )
          })}
        </div>
      </div>

      {/* Health tip */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-beta-mint/5 to-transparent p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-beta-mint/60">Consejo de Salud</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          Recuerda beber al menos 8 vasos de agua al día y mantener tus controles médicos al día.
        </p>
      </div>
    </div>
  )
}
