import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import {
  CalendarPlus,
  CheckCircle2,
  Stethoscope,
  CalendarClock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useData } from '../../context/DataContext'

/* ── Config ───────────────────────────────────────────── */

const specialties = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
]

const doctorBySpecialty: Record<string, string> = {
  'Medicina General': 'Dr. Rodríguez',
  'Cardiología': 'Dra. Martínez',
  'Dermatología': 'Dr. Herrera',
  'Pediatría': 'Dra. Martínez',
  'Ginecología': 'Dra. López',
}

const allSlots = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '14:00 PM', '14:30 PM', '15:00 PM', '15:30 PM',
  '16:00 PM', '16:30 PM',
]

/* ── Helpers ───────────────────────────────────────────── */

function getNext14Days() {
  const days: { iso: string; dayNum: string; dayName: string; monthLabel: string; fullLabel: string }[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      iso: d.toISOString().split('T')[0],
      dayNum: d.getDate().toString(),
      dayName: d.toLocaleDateString('es-CO', { weekday: 'short' }).replace('.', ''),
      monthLabel: d.toLocaleDateString('es-CO', { month: 'short' }).replace('.', ''),
      fullLabel: d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }
  return days
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ── Component ────────────────────────────────────────── */

export default function PortalAgendar() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { appointments, setAppointments } = useData()

  const days = useMemo(() => getNext14Days(), [])
  const [specialty, setSpecialty] = useState(specialties[0])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const doctor = doctorBySpecialty[specialty] ?? 'Dr. Rodríguez'

  // Occupied times: match doctor's existing appointments
  const occupiedTimes = useMemo(() => {
    return new Set(
      appointments
        .filter((a) => a.doctor === doctor && a.status !== 'Cancelada')
        .map((a) => a.time),
    )
  }, [appointments, doctor])

  const selectedDayInfo = days.find((d) => d.iso === selectedDate)

  function scrollCarousel(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }

  function handleConfirm() {
    if (!selectedDate || !selectedTime) return

    const patientName = user?.fullName || user?.firstName || 'Paciente Portal'

    // Save to shared DataContext → appears in admin Dashboard instantly
    setAppointments((prev) => [
      ...prev,
      {
        patient: patientName,
        time: selectedTime,
        doctor,
        status: 'Pendiente',
      },
    ])

    setShowSuccess(true)
  }

  // Redirect after success animation
  useEffect(() => {
    if (!showSuccess) return
    const id = setTimeout(() => navigate('/portal'), 2200)
    return () => clearTimeout(id)
  }, [showSuccess, navigate])

  /* ── Success overlay ──────────────────────────────────── */

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900">
        <div className="animate-[pop-in_0.5s_ease-out_both] text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-beta-mint/20">
            <CheckCircle2 size={52} className="text-beta-mint" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-bold text-zinc-100">
            ¡Cita Confirmada!
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {capitalize(selectedDayInfo?.fullLabel ?? '')} a las {selectedTime}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {specialty} — {doctor}
          </p>
          <div className="mt-6">
            <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full animate-[fill-bar_2s_linear_both] bg-beta-mint" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main form ────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Agendar Cita</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Selecciona especialidad, fecha y hora</p>
      </div>

      {/* ── Step 1: Specialty ──────────────────────────── */}
      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          1 · Especialidad
        </label>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => { setSpecialty(s); setSelectedTime('') }}
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
                specialty === s
                  ? 'border-beta-mint bg-beta-mint/15 text-beta-mint'
                  : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 active:bg-zinc-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <Stethoscope size={13} />
          {doctor}
        </p>
      </div>

      {/* ── Step 2: Date carousel ─────────────────────── */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            2 · Fecha
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => scrollCarousel(-1)}
              className="rounded-lg border border-zinc-700 p-1 text-zinc-500 transition-colors active:bg-zinc-800"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              className="rounded-lg border border-zinc-700 p-1 text-zinc-500 transition-colors active:bg-zinc-800"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {days.map((d) => {
            const isSelected = selectedDate === d.iso
            return (
              <button
                key={d.iso}
                onClick={() => { setSelectedDate(d.iso); setSelectedTime('') }}
                className={`flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-colors ${
                  isSelected
                    ? 'border-beta-mint bg-beta-mint/15 text-beta-mint'
                    : 'border-zinc-700/60 bg-zinc-800/40 text-zinc-400 active:bg-zinc-800'
                }`}
              >
                <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{d.dayName}</span>
                <span className="mt-0.5 text-xl font-bold leading-none">{d.dayNum}</span>
                <span className="mt-1 text-[10px] font-medium uppercase opacity-50">{d.monthLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Step 3: Time slots ────────────────────────── */}
      {selectedDate && (
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            3 · Hora disponible
          </label>
          <div className="grid grid-cols-3 gap-2">
            {allSlots.map((slot) => {
              const isOccupied = occupiedTimes.has(slot)
              const isSelected = selectedTime === slot
              return (
                <button
                  key={slot}
                  disabled={isOccupied}
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-beta-mint bg-beta-mint/15 text-beta-mint'
                      : isOccupied
                        ? 'border-zinc-800 bg-zinc-800/20 text-zinc-600 line-through'
                        : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 active:bg-zinc-800'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
          {occupiedTimes.size > 0 && (
            <p className="mt-2 text-[10px] text-zinc-600">
              Las horas tachadas ya están ocupadas con {doctor}
            </p>
          )}
        </div>
      )}

      {/* ── Step 4: Summary + Confirm ─────────────────── */}
      {selectedDate && selectedTime && (
        <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-800/50">
          <div className="border-b border-zinc-700/50 px-4 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Resumen de tu cita</p>
          </div>
          <div className="space-y-2.5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-beta-mint/15">
                <Stethoscope size={18} className="text-beta-mint" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-100">{doctor}</p>
                <p className="text-xs text-zinc-500">{specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <CalendarClock size={13} />
                {capitalize(selectedDayInfo?.fullLabel ?? '')}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {selectedTime}
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={handleConfirm}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-beta-mint py-3.5 text-sm font-bold text-zinc-900 transition-colors active:bg-beta-mint/80"
            >
              <CalendarPlus size={18} />
              Confirmar Cita
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedDate && (
        <div className="rounded-2xl border border-dashed border-zinc-700 py-14 text-center">
          <CalendarClock size={32} className="mx-auto text-zinc-700" />
          <p className="mt-2 text-sm text-zinc-500">Selecciona una fecha para ver horarios</p>
        </div>
      )}
    </div>
  )
}
