import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Stethoscope,
  SmilePlus,
  Baby,
  Apple,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  User,
  CalendarCheck,
  Check,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react'

/* ── Specialty config (single source of truth) ─────────── */

type SpecialtyKey = 'general' | 'dental' | 'pediatrics' | 'nutrition'

interface SpecialtyConfig {
  key: SpecialtyKey
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  color: string      // primary
  accent: string     // accent / glow
  emoji: string
  motivos: string[]
  doctor: string
}

const SPECIALTY_DATA: SpecialtyConfig[] = [
  {
    key: 'general',
    label: 'Medicina General',
    icon: Stethoscope,
    color: '#7C3AED',
    accent: '#7FFFD4',
    emoji: '🩺',
    motivos: ['Consulta General', 'Certificado Médico', 'Revisión de Exámenes', 'Control de Presión'],
    doctor: 'Dr. Rodríguez',
  },
  {
    key: 'dental',
    label: 'Odontología',
    icon: SmilePlus,
    color: '#0EA5E9',
    accent: '#22D3EE',
    emoji: '🦷',
    motivos: ['Limpieza Dental', 'Dolor de Muelas', 'Ortodoncia', 'Blanqueamiento', 'Extracción'],
    doctor: 'Dra. Martínez',
  },
  {
    key: 'pediatrics',
    label: 'Pediatría',
    icon: Baby,
    color: '#F43F5E',
    accent: '#FBBF24',
    emoji: '👶',
    motivos: ['Control Niño Sano', 'Vacunación', 'Enfermedad / Urgencia', 'Control de Crecimiento'],
    doctor: 'Dra. López',
  },
  {
    key: 'nutrition',
    label: 'Nutrición',
    icon: Apple,
    color: '#10B981',
    accent: '#A3E635',
    emoji: '🥗',
    motivos: ['Primera Vez', 'Control de Peso', 'Plan Deportivo', 'Plan para Embarazo'],
    doctor: 'Lic. Herrera',
  },
]

/* ── Time slots ────────────────────────────────────────── */

const ALL_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '14:00 PM', '14:30 PM', '15:00 PM', '15:30 PM',
  '16:00 PM', '16:30 PM',
]

// Simulate some occupied slots per day
function getOccupied(dateIso: string): Set<string> {
  const seed = dateIso.split('-').reduce((a, b) => a + Number(b), 0)
  const set = new Set<string>()
  ALL_SLOTS.forEach((s, i) => {
    if ((seed * (i + 3)) % 5 === 0) set.add(s)
  })
  return set
}

/* ── Date helpers ──────────────────────────────────────── */

function getNext14Days() {
  const days: { iso: string; dayNum: string; dayName: string; monthLabel: string; fullLabel: string }[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      iso: d.toISOString().split('T')[0],
      dayNum: d.getDate().toString(),
      dayName: d.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
      monthLabel: d.toLocaleDateString('es', { month: 'short' }).replace('.', ''),
      fullLabel: d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }
  return days
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ── Animation variants ────────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
}

/* ── Component ─────────────────────────────────────────── */

export default function PublicBookingWizard() {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1) // 1 = forward, -1 = back

  /* ── Wizard state ───────────────────────────────────── */
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyConfig | null>(null)
  const [motivo, setMotivo] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const days = useMemo(() => getNext14Days(), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  const occupied = useMemo(
    () => (selectedDate ? getOccupied(selectedDate) : new Set<string>()),
    [selectedDate],
  )

  const selectedDayInfo = days.find((d) => d.iso === selectedDate)

  /* ── Theme color from specialty ─────────────────────── */
  const themeColor = selectedSpecialty?.color ?? '#7C3AED'
  const themeAccent = selectedSpecialty?.accent ?? '#7FFFD4'

  /* ── Navigation ─────────────────────────────────────── */

  function goNext() {
    setDir(1)
    setStep((s) => s + 1)
  }
  function goBack() {
    setDir(-1)
    setStep((s) => s - 1)
  }

  function canProceed() {
    if (step === 1) return !!selectedSpecialty
    if (step === 2) return !!motivo
    if (step === 3) return !!selectedDate && !!selectedTime
    if (step === 4) return !!nombre.trim() && !!telefono.trim()
    return true
  }

  function scrollCarousel(d: number) {
    scrollRef.current?.scrollBy({ left: d * 200, behavior: 'smooth' })
  }

  /* ── Confirm ────────────────────────────────────────── */

  function handleConfirm() {
    setConfirmed(true)
    toast.success('¡Cita confirmada!')
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `¡Hola! Quisiera confirmar mi cita:\n` +
      `📋 *${motivo}* — ${selectedSpecialty?.label}\n` +
      `👨‍⚕️ ${selectedSpecialty?.doctor}\n` +
      `📅 ${capitalize(selectedDayInfo?.fullLabel ?? '')} a las ${selectedTime}\n` +
      `👤 ${nombre}\n📞 ${telefono}`
    )
    window.open(`https://wa.me/?text=${msg}`, '_blank')
  }

  /* ── Step indicator ─────────────────────────────────── */

  const STEPS = ['Especialidad', 'Motivo', 'Fecha', 'Datos', 'Confirmar']

  /* ── Success screen ─────────────────────────────────── */

  if (confirmed) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColor + '20' }}
          >
            <CalendarCheck size={48} style={{ color: themeAccent }} />
          </div>
          <h2 className="text-2xl font-bold text-clinical-white">¡Cita Confirmada!</h2>
          <p className="mt-2 text-sm text-gray-400">
            {capitalize(selectedDayInfo?.fullLabel ?? '')} a las {selectedTime}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {motivo} — {selectedSpecialty?.doctor}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle size={18} />
              Enviar por WhatsApp
            </button>
            <button
              onClick={() => {
                setStep(1)
                setSelectedSpecialty(null)
                setMotivo('')
                setSelectedDate('')
                setSelectedTime('')
                setNombre('')
                setTelefono('')
                setEmail('')
                setConfirmed(false)
              }}
              className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800"
            >
              Nueva Cita
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ── Main render ────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-2xl">
      {/* ── Step indicator ─────────────────────────────── */}
      <div className="mb-8 flex items-center justify-center gap-1">
        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const isActive = stepNum === step
          const isDone = stepNum < step
          return (
            <div key={label} className="flex items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all"
                style={{
                  backgroundColor: isActive ? themeColor : isDone ? themeColor + '30' : 'transparent',
                  color: isActive ? '#fff' : isDone ? themeAccent : '#6B7280',
                  border: isActive || isDone ? 'none' : '1px solid #374151',
                }}
              >
                {isDone ? <Check size={14} /> : stepNum}
              </div>
              <span className={`hidden text-xs font-medium sm:inline ${isActive ? 'text-clinical-white' : 'text-gray-500'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className="mx-1 h-px w-5 sm:w-8"
                  style={{ backgroundColor: isDone ? themeColor + '50' : '#374151' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Animated step content ──────────────────────── */}
      <div className="relative min-h-[420px] overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* ═══ STEP 1: SPECIALTY ══════════════════════ */}
            {step === 1 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-clinical-white">¿Qué especialidad necesitas?</h2>
                <p className="mb-6 text-sm text-gray-500">Selecciona para personalizar tu experiencia</p>

                <div className="grid grid-cols-2 gap-3">
                  {SPECIALTY_DATA.map((sp) => {
                    const isSelected = selectedSpecialty?.key === sp.key
                    const Icon = sp.icon
                    return (
                      <button
                        key={sp.key}
                        type="button"
                        onClick={() => {
                          setSelectedSpecialty(sp)
                          setMotivo('')
                        }}
                        className="group relative overflow-hidden rounded-2xl border-2 p-5 text-left transition-all"
                        style={{
                          borderColor: isSelected ? sp.color : '#374151',
                          backgroundColor: isSelected ? sp.color + '10' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <div
                            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full"
                            style={{ backgroundColor: sp.color }}
                          >
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <div
                          className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors"
                          style={{
                            backgroundColor: isSelected ? sp.color + '25' : '#1F2937',
                            color: isSelected ? sp.accent : '#6B7280',
                          }}
                        >
                          <Icon size={24} />
                        </div>
                        <p className="text-lg font-bold text-clinical-white">
                          {sp.emoji} {sp.label}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{sp.doctor}</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ═══ STEP 2: MOTIVO ═════════════════════════ */}
            {step === 2 && selectedSpecialty && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-clinical-white">¿Cuál es el motivo de tu visita?</h2>
                <p className="mb-6 text-sm text-gray-500">
                  Opciones de <span style={{ color: themeAccent }}>{selectedSpecialty.label}</span>
                </p>

                <div className="grid gap-2.5">
                  {selectedSpecialty.motivos.map((m) => {
                    const isSelected = motivo === m
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMotivo(m)}
                        className="flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all"
                        style={{
                          borderColor: isSelected ? themeColor : '#374151',
                          backgroundColor: isSelected ? themeColor + '10' : 'transparent',
                        }}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: isSelected ? themeColor + '25' : '#1F2937',
                          }}
                        >
                          <Sparkles size={18} style={{ color: isSelected ? themeAccent : '#6B7280' }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-clinical-white">{m}</p>
                        </div>
                        {isSelected && (
                          <div className="ml-auto">
                            <Check size={18} style={{ color: themeAccent }} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ═══ STEP 3: DATE & TIME ════════════════════ */}
            {step === 3 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-clinical-white">Elige fecha y hora</h2>
                <p className="mb-5 text-sm text-gray-500">Horarios disponibles para {selectedSpecialty?.doctor}</p>

                {/* Date carousel */}
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Fecha</span>
                  <div className="flex gap-1">
                    <button onClick={() => scrollCarousel(-1)} className="rounded-lg border border-gray-700 p-1 text-gray-500 transition-colors hover:bg-gray-800">
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={() => scrollCarousel(1)} className="rounded-lg border border-gray-700 p-1 text-gray-500 transition-colors hover:bg-gray-800">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex gap-2 overflow-x-auto pb-3 scrollbar-none"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {days.map((d) => {
                    const isSelected = selectedDate === d.iso
                    return (
                      <button
                        key={d.iso}
                        onClick={() => { setSelectedDate(d.iso); setSelectedTime('') }}
                        className="flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-all"
                        style={{
                          borderColor: isSelected ? themeColor : '#374151',
                          backgroundColor: isSelected ? themeColor + '15' : 'transparent',
                          color: isSelected ? themeAccent : '#9CA3AF',
                        }}
                      >
                        <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{d.dayName}</span>
                        <span className="mt-0.5 text-xl font-bold leading-none">{d.dayNum}</span>
                        <span className="mt-1 text-[10px] font-medium uppercase opacity-50">{d.monthLabel}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Time slots */}
                {selectedDate ? (
                  <div className="mt-4">
                    <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <Clock size={11} className="mr-1 inline" />
                      Horarios — {capitalize(selectedDayInfo?.fullLabel ?? '')}
                    </span>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {ALL_SLOTS.map((slot) => {
                        const isOcc = occupied.has(slot)
                        const isSel = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            disabled={isOcc}
                            onClick={() => setSelectedTime(slot)}
                            className="rounded-xl border py-2.5 text-xs font-semibold transition-all disabled:cursor-not-allowed"
                            style={{
                              borderColor: isSel ? themeColor : isOcc ? '#1F2937' : '#374151',
                              backgroundColor: isSel ? themeColor + '15' : 'transparent',
                              color: isSel ? themeAccent : isOcc ? '#374151' : '#D1D5DB',
                              textDecoration: isOcc ? 'line-through' : 'none',
                            }}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-gray-700 py-12 text-center">
                    <CalendarCheck size={28} className="mx-auto text-gray-700" />
                    <p className="mt-2 text-sm text-gray-500">Selecciona una fecha para ver horarios</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ STEP 4: PATIENT DATA ═══════════════════ */}
            {step === 4 && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-clinical-white">Tus Datos</h2>
                <p className="mb-6 text-sm text-gray-500">Necesitamos tu información para agendar la cita</p>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">Nombre Completo *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500"
                        style={{ '--tw-ring-color': themeColor + '30' } as React.CSSProperties}
                        onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.boxShadow = `0 0 0 3px ${themeColor}20` }}
                        onBlur={(e) => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">Teléfono / WhatsApp *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+502 1234 5678"
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500"
                        onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.boxShadow = `0 0 0 3px ${themeColor}20` }}
                        onBlur={(e) => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">Correo Electrónico</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-xl border border-gray-700 bg-gray-800 py-3 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500"
                        onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.boxShadow = `0 0 0 3px ${themeColor}20` }}
                        onBlur={(e) => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 5: CONFIRMATION ═══════════════════ */}
            {step === 5 && selectedSpecialty && (
              <div>
                <h2 className="mb-1 text-xl font-bold text-clinical-white">Confirma tu Cita</h2>
                <p className="mb-6 text-sm text-gray-500">Revisa los datos antes de confirmar</p>

                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: themeColor + '40' }}
                >
                  {/* Accent bar */}
                  <div className="h-1.5" style={{ backgroundColor: themeColor }} />

                  <div className="space-y-4 p-5">
                    {/* Specialty + Doctor */}
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ backgroundColor: themeColor + '20' }}
                      >
                        <span style={{ color: themeAccent }}>
                          {(() => { const Icon = selectedSpecialty.icon; return <Icon size={24} />; })()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-clinical-white">{selectedSpecialty.label}</p>
                        <p className="text-xs text-gray-500">{selectedSpecialty.doctor}</p>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid gap-3 rounded-xl border border-gray-700/50 bg-gray-800/30 p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Motivo</p>
                        <p className="mt-0.5 text-sm font-medium text-clinical-white">{motivo}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Fecha y Hora</p>
                        <p className="mt-0.5 text-sm font-medium text-clinical-white">
                          {capitalize(selectedDayInfo?.fullLabel ?? '')}
                        </p>
                        <p className="text-xs" style={{ color: themeAccent }}>{selectedTime}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Paciente</p>
                        <p className="mt-0.5 text-sm font-medium text-clinical-white">{nombre}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Contacto</p>
                        <p className="mt-0.5 text-sm font-medium text-clinical-white">{telefono}</p>
                        {email && <p className="text-xs text-gray-500">{email}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Navigation footer ─────────────────────────── */}
      <div className="mt-6 flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-clinical-white"
          >
            <ArrowLeft size={16} />
            Atrás
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: themeColor }}
          >
            Siguiente
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.97]"
            style={{ backgroundColor: themeColor, boxShadow: `0 8px 25px ${themeColor}30` }}
          >
            <CalendarCheck size={18} />
            Confirmar Cita
          </button>
        )}
      </div>
    </div>
  )
}
