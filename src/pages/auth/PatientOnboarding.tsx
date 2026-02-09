import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Calendar,
  Droplets,
  AlertCircle,
  Shield,
  Phone,
  Heart,
  UserPlus,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import type { PatientHealthData } from '../../components/PatientPortal'

/* ── Constants ──────────────────────────────────────────── */

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
const GENDERS = ['Masculino', 'Femenino']
const COMMON_ALLERGIES = ['Penicilina', 'Sulfas', 'Aspirina', 'Ibuprofeno', 'Latex', 'Ninguna']
const INSURERS = [
  'Seguros G&T',
  'Seguros El Roble',
  'Seguros Universales',
  'IGSS',
  'Seguros Columna',
  'Ninguno (pago directo)',
]

const TOTAL_STEPS = 4

/* ── Animation variants ────────────────────────────────── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const stagger = { visible: { transition: { staggerChildren: 0.06 } } }

/* ── Pill selector component ───────────────────────────── */

function PillSelector({
  options,
  selected,
  onSelect,
  multi = false,
  color = '#7FFFD4',
}: {
  options: string[]
  selected: string | string[]
  onSelect: (val: string) => void
  multi?: boolean
  color?: string
}) {
  const isSelected = (opt: string) =>
    multi ? (selected as string[]).includes(opt) : selected === opt

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all active:scale-95 ${
            isSelected(opt)
              ? 'text-omega-abyss shadow-lg'
              : 'border border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]'
          }`}
          style={
            isSelected(opt)
              ? { backgroundColor: color, boxShadow: `0 4px 20px ${color}30` }
              : undefined
          }
        >
          {isSelected(opt) && <Check size={14} className="mr-1.5 inline" />}
          {opt}
        </button>
      ))}
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function PatientOnboarding() {
  const navigate = useNavigate()
  const { user } = useUser()

  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  // Step 1: Personal
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [genero, setGenero] = useState('')
  const [telefono, setTelefono] = useState('')

  // Step 2: Medical
  const [tipoSangre, setTipoSangre] = useState('')
  const [alergias, setAlergias] = useState<string[]>([])

  // Step 3: Insurance & Emergency
  const [seguro, setSeguro] = useState('')
  const [contactoEmergencia, setContactoEmergencia] = useState('')
  const [telefonoEmergencia, setTelefonoEmergencia] = useState('')

  // Pre-fill phone from Clerk
  useEffect(() => {
    if (user?.primaryPhoneNumber?.phoneNumber) {
      setTelefono(user.primaryPhoneNumber.phoneNumber)
    }
  }, [user])

  /* ── Navigation ────────────────────────────────────── */

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }, [step])

  const goBack = useCallback(() => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }, [step])

  /* ── Validation per step ───────────────────────────── */

  function isStepValid() {
    switch (step) {
      case 1:
        return fechaNacimiento !== '' && genero !== ''
      case 2:
        return tipoSangre !== '' && alergias.length > 0
      case 3:
        return seguro !== ''
      case 4:
        return true
      default:
        return false
    }
  }

  /* ── Toggle allergy ────────────────────────────────── */

  function toggleAllergy(val: string) {
    if (val === 'Ninguna') {
      setAlergias(['Ninguna'])
      return
    }
    setAlergias((prev) => {
      const filtered = prev.filter((a) => a !== 'Ninguna')
      return filtered.includes(val)
        ? filtered.filter((a) => a !== val)
        : [...filtered, val]
    })
  }

  /* ── Save & finish ─────────────────────────────────── */

  function handleFinish() {
    const data: PatientHealthData = {
      tipoSangre,
      alergias: alergias.filter((a) => a !== 'Ninguna'),
      seguro: seguro === 'Ninguno (pago directo)' ? 'Pago directo' : seguro,
      fechaNacimiento,
      genero,
      contactoEmergencia: contactoEmergencia
        ? `${contactoEmergencia} — ${telefonoEmergencia}`
        : '',
      telefono,
    }
    localStorage.setItem('beta_patient_health', JSON.stringify(data))
    localStorage.setItem('beta_patient_onboarded', 'true')
    navigate('/mi-salud', { replace: true })
  }

  /* ── Progress ──────────────────────────────────────── */

  const progress = (step / TOTAL_STEPS) * 100
  const firstName = user?.firstName || 'Paciente'

  /* ── Step labels for header ────────────────────────── */

  const stepLabels = [
    'Datos personales',
    'Información médica',
    'Seguro y emergencia',
    'Confirmar',
  ]

  return (
    <div className="flex min-h-dvh justify-center bg-omega-abyss">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none fixed -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#7C3AED] opacity-[0.12] blur-[120px]"
        style={{ animation: 'float-orb 20s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-20 h-[350px] w-[350px] rounded-full bg-[#7FFFD4] opacity-[0.08] blur-[120px]"
        style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
      />

      <div className="relative flex w-full max-w-md flex-col px-5 pb-8 pt-6">
        {/* ── Header ────────────────────────────────────── */}
        <div className="mb-6">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-8 w-auto object-contain"
            />
            <span className="text-sm font-bold tracking-tight text-white">
              Beta <span className="text-beta-mint">Life</span>
            </span>
            <div className="ml-auto rounded-full border border-beta-mint/20 bg-beta-mint/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-beta-mint">
              Paso {step} de {TOTAL_STEPS}
            </div>
          </div>

          {/* Progress bar — endowed progress (starts at 25%) */}
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-beta-mint to-omega-violet"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Step label */}
          <p className="mt-3 text-[11px] font-medium text-white/30">
            {stepLabels[step - 1]}
          </p>
        </div>

        {/* ── Step content ──────────────────────────────── */}
        <div className="relative flex-1">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepPersonal
                  firstName={firstName}
                  fechaNacimiento={fechaNacimiento}
                  setFechaNacimiento={setFechaNacimiento}
                  genero={genero}
                  setGenero={setGenero}
                  telefono={telefono}
                  setTelefono={setTelefono}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepMedical
                  tipoSangre={tipoSangre}
                  setTipoSangre={setTipoSangre}
                  alergias={alergias}
                  toggleAllergy={toggleAllergy}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepInsurance
                  seguro={seguro}
                  setSeguro={setSeguro}
                  contactoEmergencia={contactoEmergencia}
                  setContactoEmergencia={setContactoEmergencia}
                  telefonoEmergencia={telefonoEmergencia}
                  setTelefonoEmergencia={setTelefonoEmergencia}
                />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <StepConfirm
                  firstName={firstName}
                  fechaNacimiento={fechaNacimiento}
                  genero={genero}
                  telefono={telefono}
                  tipoSangre={tipoSangre}
                  alergias={alergias}
                  seguro={seguro}
                  contactoEmergencia={contactoEmergencia}
                  telefonoEmergencia={telefonoEmergencia}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bottom nav ────────────────────────────────── */}
        <div className="mt-8 flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/60 transition-all active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!isStepValid()}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-beta-mint font-bold text-omega-abyss shadow-lg shadow-beta-mint/20 transition-all active:scale-[0.97] disabled:opacity-30 disabled:shadow-none"
            >
              Continuar
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-beta-mint font-bold text-omega-abyss shadow-lg shadow-beta-mint/20 transition-all active:scale-[0.97]"
            >
              <Sparkles size={18} />
              Completar Perfil
            </button>
          )}
        </div>

        {/* Trust signals */}
        <div className="mt-5 flex items-center justify-center gap-4 text-[10px] text-white/15">
          <span className="flex items-center gap-1">
            <Lock size={10} />
            Cifrado E2E
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={10} />
            HIPAA Ready
          </span>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 1: Personal info
   ══════════════════════════════════════════════════════════ */

function StepPersonal({
  firstName,
  fechaNacimiento,
  setFechaNacimiento,
  genero,
  setGenero,
  telefono,
  setTelefono,
}: {
  firstName: string
  fechaNacimiento: string
  setFechaNacimiento: (v: string) => void
  genero: string
  setGenero: (v: string) => void
  telefono: string
  setTelefono: (v: string) => void
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Hola, {firstName}{' '}
          <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
            Bienvenido
          </span>
        </h1>
        <p className="mt-1.5 text-sm text-white/40">
          Necesitamos algunos datos para personalizar tu experiencia de salud.
        </p>
      </motion.div>

      {/* Reciprocity card */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="rounded-2xl border border-beta-mint/10 bg-beta-mint/[0.04] p-3.5"
      >
        <div className="flex items-start gap-2.5">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-beta-mint" />
          <p className="text-xs leading-relaxed text-white/50">
            Con esta información tu doctor podrá atenderte mejor y más rápido en cada consulta.
          </p>
        </div>
      </motion.div>

      {/* Date of birth */}
      <motion.div variants={fadeUp} custom={2} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <Calendar size={14} className="text-beta-mint" />
          Fecha de nacimiento
        </label>
        <input
          type="date"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition-all focus:border-beta-mint/40 focus:bg-white/[0.05] [&::-webkit-calendar-picker-indicator]:invert"
        />
      </motion.div>

      {/* Gender */}
      <motion.div variants={fadeUp} custom={3} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <User size={14} className="text-beta-mint" />
          Género
        </label>
        <PillSelector
          options={GENDERS}
          selected={genero}
          onSelect={setGenero}
        />
      </motion.div>

      {/* Phone */}
      <motion.div variants={fadeUp} custom={4} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <Phone size={14} className="text-beta-mint" />
          Teléfono
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+502 5555 1234"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-beta-mint/40 focus:bg-white/[0.05]"
        />
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 2: Medical info
   ══════════════════════════════════════════════════════════ */

function StepMedical({
  tipoSangre,
  setTipoSangre,
  alergias,
  toggleAllergy,
}: {
  tipoSangre: string
  setTipoSangre: (v: string) => void
  alergias: string[]
  toggleAllergy: (v: string) => void
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} custom={0}>
        <h2 className="text-xl font-black tracking-tight text-white">
          Información{' '}
          <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
            Médica
          </span>
        </h2>
        <p className="mt-1.5 text-sm text-white/40">
          Datos esenciales para tu seguridad en consulta.
        </p>
      </motion.div>

      {/* Blood type */}
      <motion.div variants={fadeUp} custom={1} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <Droplets size={14} className="text-red-400" />
          Tipo de sangre
        </label>
        <PillSelector
          options={BLOOD_TYPES}
          selected={tipoSangre}
          onSelect={setTipoSangre}
          color="#F87171"
        />
      </motion.div>

      {/* Allergies */}
      <motion.div variants={fadeUp} custom={2} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <AlertCircle size={14} className="text-amber-400" />
          Alergias conocidas
          <span className="text-[10px] font-normal text-white/25">(selecciona todas)</span>
        </label>
        <PillSelector
          options={COMMON_ALLERGIES}
          selected={alergias}
          onSelect={toggleAllergy}
          multi
          color="#FBBF24"
        />
      </motion.div>

      {/* Authority micro-copy */}
      <motion.div variants={fadeUp} custom={3} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-white/25" />
          <p className="text-[11px] leading-relaxed text-white/30">
            Tu información médica está protegida con cifrado de extremo a extremo y cumple con estándares HIPAA.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 3: Insurance & Emergency
   ══════════════════════════════════════════════════════════ */

function StepInsurance({
  seguro,
  setSeguro,
  contactoEmergencia,
  setContactoEmergencia,
  telefonoEmergencia,
  setTelefonoEmergencia,
}: {
  seguro: string
  setSeguro: (v: string) => void
  contactoEmergencia: string
  setContactoEmergencia: (v: string) => void
  telefonoEmergencia: string
  setTelefonoEmergencia: (v: string) => void
}) {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} custom={0}>
        <h2 className="text-xl font-black tracking-tight text-white">
          Seguro y{' '}
          <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
            Emergencia
          </span>
        </h2>
        <p className="mt-1.5 text-sm text-white/40">
          Casi listo. Solo unos detalles más.
        </p>
      </motion.div>

      {/* Goal-gradient: "almost done" */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="flex items-center gap-3 rounded-2xl border border-beta-mint/10 bg-beta-mint/[0.04] p-3.5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-beta-mint/15">
          <Heart size={20} className="text-beta-mint" />
        </div>
        <div>
          <p className="text-sm font-bold text-white/80">Ya casi terminas</p>
          <p className="text-[11px] text-white/40">Tu perfil está al 75% completo</p>
        </div>
      </motion.div>

      {/* Insurance */}
      <motion.div variants={fadeUp} custom={2} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <Shield size={14} className="text-blue-400" />
          Seguro médico
        </label>
        <PillSelector
          options={INSURERS}
          selected={seguro}
          onSelect={setSeguro}
          color="#60A5FA"
        />
      </motion.div>

      {/* Emergency contact */}
      <motion.div variants={fadeUp} custom={3} className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-white/60">
          <UserPlus size={14} className="text-pink-400" />
          Contacto de emergencia
          <span className="text-[10px] font-normal text-white/25">(opcional)</span>
        </label>
        <input
          type="text"
          value={contactoEmergencia}
          onChange={(e) => setContactoEmergencia(e.target.value)}
          placeholder="Nombre del contacto"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-beta-mint/40 focus:bg-white/[0.05]"
        />
        <input
          type="tel"
          value={telefonoEmergencia}
          onChange={(e) => setTelefonoEmergencia(e.target.value)}
          placeholder="Teléfono del contacto"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-beta-mint/40 focus:bg-white/[0.05]"
        />
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   STEP 4: Confirm
   ══════════════════════════════════════════════════════════ */

function StepConfirm({
  firstName,
  fechaNacimiento,
  genero,
  telefono,
  tipoSangre,
  alergias,
  seguro,
  contactoEmergencia,
  telefonoEmergencia,
}: {
  firstName: string
  fechaNacimiento: string
  genero: string
  telefono: string
  tipoSangre: string
  alergias: string[]
  seguro: string
  contactoEmergencia: string
  telefonoEmergencia: string
}) {
  const rows = [
    { label: 'Nacimiento', value: fechaNacimiento, icon: Calendar, color: 'text-beta-mint bg-beta-mint/15' },
    { label: 'Género', value: genero, icon: User, color: 'text-pink-400 bg-pink-400/15' },
    { label: 'Teléfono', value: telefono || '—', icon: Phone, color: 'text-emerald-400 bg-emerald-400/15' },
    { label: 'Sangre', value: tipoSangre, icon: Droplets, color: 'text-red-400 bg-red-400/15' },
    { label: 'Alergias', value: alergias.join(', '), icon: AlertCircle, color: 'text-amber-400 bg-amber-400/15' },
    { label: 'Seguro', value: seguro, icon: Shield, color: 'text-blue-400 bg-blue-400/15' },
  ]

  if (contactoEmergencia) {
    rows.push({
      label: 'Emergencia',
      value: `${contactoEmergencia} — ${telefonoEmergencia}`,
      icon: UserPlus,
      color: 'text-pink-400 bg-pink-400/15',
    })
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      {/* Success header */}
      <motion.div variants={fadeUp} custom={0} className="text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-beta-mint/15"
        >
          <Check size={32} className="text-beta-mint" />
        </motion.div>
        <h2 className="text-xl font-black tracking-tight text-white">
          Todo listo,{' '}
          <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
            {firstName}
          </span>
        </h2>
        <p className="mt-1.5 text-sm text-white/40">
          Verifica que tu información sea correcta.
        </p>
      </motion.div>

      {/* Summary card */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm"
      >
        {rows.map(({ label, value, icon: Icon, color }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 px-4 py-3 ${
              i < rows.length - 1 ? 'border-b border-white/[0.04]' : ''
            }`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25">
                {label}
              </p>
              <p className="truncate text-sm font-medium text-white/80">{value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Social proof */}
      <motion.div variants={fadeUp} custom={2} className="text-center">
        <p className="text-[11px] text-white/25">
          340+ profesionales y miles de pacientes confían en Beta Clinic
        </p>
      </motion.div>
    </motion.div>
  )
}
