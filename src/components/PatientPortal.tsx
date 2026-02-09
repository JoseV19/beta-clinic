import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { useUser, useClerk } from '@clerk/clerk-react'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'
import {
  Home,
  HeartPulse,
  CalendarDays,
  UserCircle,
  CalendarClock,
  Phone,
  MapPin,
  FileText,
  Clock,
  Stethoscope,
  Pill,
  Plus,
  ChevronDown,
  ChevronUp,
  Download,
  Activity,
  Syringe,
  Salad,
  Droplets,
  Heart,
  AlertCircle,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Fingerprint,
  CheckCircle2,
  X,
  CalendarPlus,
  Lock,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Palette,
  ArrowLeft,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import type { AgendaAppointment } from '../types/phase2'
import { useSettings } from '../context/SettingsContext'
import { useTheme } from '../context/ThemeContext'
import {
  SPECIALTY_DATA,
  ALL_SLOTS,
  getOccupied,
  getNext14Days,
  capitalize,
  type SpecialtyConfig,
} from '../data/specialties'

/* ── Types ─────────────────────────────────────────────── */

type Tab = 'inicio' | 'salud' | 'citas' | 'perfil'

const TAB_CONFIG: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'inicio', label: 'Inicio', icon: Home },
  { key: 'salud', label: 'Salud', icon: HeartPulse },
  { key: 'citas', label: 'Citas', icon: CalendarDays },
  { key: 'perfil', label: 'Perfil', icon: UserCircle },
]

/* ── Animation variants ────────────────────────────────── */

const tabIdx = (t: Tab) => TAB_CONFIG.findIndex((c) => c.key === t)

function getDirection(from: Tab, to: Tab) {
  return tabIdx(to) > tabIdx(from) ? 1 : -1
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ── Countdown hook ────────────────────────────────────── */

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

/* ── Mock data ─────────────────────────────────────────── */

function getNextAppointment() {
  const date = new Date()
  date.setDate(date.getDate() + 2)
  date.setHours(9, 30, 0, 0)
  const formatted = date.toLocaleDateString('es-GT', {
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

interface TimelineEvent {
  id: number
  fecha: string
  titulo: string
  doctor: string
  tipo: 'consulta' | 'laboratorio' | 'receta' | 'vacuna'
  detalle: string
}

const mockTimeline: TimelineEvent[] = [
  { id: 1, fecha: '2026-02-03', titulo: 'Consulta General', doctor: 'Dr. Rodríguez', tipo: 'consulta', detalle: 'Control de presión arterial. PA: 120/80 mmHg.' },
  { id: 2, fecha: '2026-01-28', titulo: 'Laboratorio: Hemograma Completo', doctor: 'Laboratorio Central', tipo: 'laboratorio', detalle: 'Resultados dentro de rangos normales.' },
  { id: 3, fecha: '2026-01-15', titulo: 'Receta: Losartán 50 mg', doctor: 'Dr. Rodríguez', tipo: 'receta', detalle: '1 tableta cada 24h por 30 días.' },
  { id: 4, fecha: '2025-12-20', titulo: 'Vacuna: Influenza 2025', doctor: 'Dra. López', tipo: 'vacuna', detalle: 'Vacunación estacional aplicada.' },
  { id: 5, fecha: '2025-12-10', titulo: 'Consulta: Cefalea tensional', doctor: 'Dr. Rodríguez', tipo: 'consulta', detalle: 'Se recetó Acetaminofén 500 mg.' },
  { id: 6, fecha: '2025-11-05', titulo: 'Laboratorio: Perfil Lipídico', doctor: 'Laboratorio Central', tipo: 'laboratorio', detalle: 'Colesterol total: 195 mg/dL. Triglicéridos: 148 mg/dL.' },
]

interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
}

interface Receta {
  id: number
  fecha: string
  doctor: string
  diagnostico: string
  medicamentos: Medicamento[]
  estado: 'activa' | 'vencida'
}

const prescriptions: Receta[] = [
  {
    id: 1,
    fecha: '2026-02-03',
    doctor: 'Dr. Rodríguez',
    diagnostico: 'Hipertensión arterial esencial',
    medicamentos: [
      { nombre: 'Losartán 50 mg', dosis: '1 tableta', frecuencia: 'Cada 24 h', duracion: '30 días' },
      { nombre: 'Amlodipino 5 mg', dosis: '1 tableta', frecuencia: 'Cada 24 h', duracion: '30 días' },
    ],
    estado: 'activa',
  },
  {
    id: 2,
    fecha: '2026-01-15',
    doctor: 'Dra. Martínez',
    diagnostico: 'Infección respiratoria aguda',
    medicamentos: [
      { nombre: 'Ibuprofeno 400 mg', dosis: '1 tableta', frecuencia: 'Cada 8 h', duracion: '5 días' },
      { nombre: 'Amoxicilina 500 mg', dosis: '1 cápsula', frecuencia: 'Cada 8 h', duracion: '7 días' },
    ],
    estado: 'vencida',
  },
]

const vaccinations = [
  { nombre: 'COVID-19 (3ra dosis)', fecha: '2025-06-15', aplicada: true },
  { nombre: 'Influenza 2025', fecha: '2025-12-20', aplicada: true },
  { nombre: 'Tétanos (refuerzo)', fecha: '2026-03-01', aplicada: false },
  { nombre: 'Hepatitis B (2da dosis)', fecha: '2026-04-10', aplicada: false },
]

const healthDataDefaults = {
  tipoSangre: 'O+',
  alergias: ['Penicilina', 'Sulfas'],
  seguro: 'Seguros G&T',
  fechaNacimiento: '1990-05-15',
  genero: 'Masculino',
  contactoEmergencia: '',
  telefono: '',
}

const healthTips = [
  'Recuerda beber al menos 8 vasos de agua al día y mantener tus controles médicos al día.',
  'Caminar 30 minutos al día reduce el riesgo cardiovascular en un 35%.',
  'Dormir entre 7-9 horas mejora tu sistema inmunológico y concentración.',
  'Una dieta rica en frutas y verduras aporta los micronutrientes esenciales.',
]

/* ── PDF generator ─────────────────────────────────────── */

const VIOLET = '#6A1B9A'
const DARK = '#4A148C'

function generateRecetaPDF(rx: Receta, clinicName: string, clinicNit: string, clinicTel: string, clinicDir: string) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  doc.setFillColor(DARK)
  doc.rect(0, 0, w, 38, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(clinicName, 15, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Protocolo Omega — Sistema Clínico', 15, y + 7)
  doc.setFontSize(8)
  doc.setTextColor('#CCCCCC')
  doc.text(`NIT: ${clinicNit} | Tel: ${clinicTel}`, w - 15, y, { align: 'right' })
  doc.text(clinicDir, w - 15, y + 7, { align: 'right' })

  y = 48
  doc.setTextColor(VIOLET)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RECETA MÉDICA', w / 2, y, { align: 'center' })

  y += 12
  doc.setDrawColor(VIOLET)
  doc.setLineWidth(0.5)
  doc.line(15, y, w - 15, y)
  y += 8

  doc.setTextColor('#333333')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Médico:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.doctor, 42, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', w - 60, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.fecha, w - 42, y)

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Diagnóstico:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.diagnostico, 50, y)

  y += 10
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)
  y += 8

  const cols = [15, 65, 100, 140]
  const colHeaders = ['Medicamento', 'Dosis', 'Frecuencia', 'Duración']
  doc.setFillColor(VIOLET)
  doc.rect(15, y - 4, w - 30, 8, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  colHeaders.forEach((h, i) => doc.text(h, cols[i] + 2, y + 1))
  y += 8

  doc.setTextColor('#333333')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  rx.medicamentos.forEach((m, idx) => {
    const bg = idx % 2 === 0 ? '#F3E5F5' : '#FFFFFF'
    doc.setFillColor(bg)
    doc.rect(15, y - 4, w - 30, 8, 'F')
    doc.text(m.nombre, cols[0] + 2, y + 1)
    doc.text(m.dosis, cols[1] + 2, y + 1)
    doc.text(m.frecuencia, cols[2] + 2, y + 1)
    doc.text(m.duracion, cols[3] + 2, y + 1)
    y += 8
  })

  y += 6
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)

  y += 25
  doc.setDrawColor('#999999')
  doc.setLineWidth(0.3)
  doc.line(w / 2 - 40, y, w / 2 + 40, y)
  y += 5
  doc.setTextColor('#666666')
  doc.setFontSize(9)
  doc.text('Firma y Sello del Médico', w / 2, y, { align: 'center' })

  y += 15
  doc.setFontSize(7)
  doc.setTextColor('#999999')
  doc.text('Este documento fue generado electrónicamente por Beta Clinic — Protocolo Omega.', w / 2, y, { align: 'center' })

  doc.save(`Receta_${rx.fecha}_${rx.doctor.replace(/\s/g, '_')}.pdf`)
}

/* ── WhatsApp icon ─────────────────────────────────────── */

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export interface PatientHealthData {
  tipoSangre: string
  alergias: string[]
  seguro: string
  fechaNacimiento: string
  genero: string
  contactoEmergencia: string
  telefono: string
}

function loadHealthData(): PatientHealthData {
  try {
    const raw = localStorage.getItem('beta_patient_health')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return healthDataDefaults
}

export interface PatientPortalProps {
  doctorPreview?: boolean
  previewPatient?: {
    id: number
    nombre: string
    email?: string
    telefono?: string
  }
  onBack?: () => void
}

export default function PatientPortal({ doctorPreview, previewPatient, onBack }: PatientPortalProps = {}) {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { clinic } = useSettings()
  const { appointments, addAppointment } = useData()
  const { monochrome, toggleMonochrome } = useTheme()

  const healthData = useMemo(() => loadHealthData(), [])
  const firstName = doctorPreview && previewPatient
    ? previewPatient.nombre.split(' ')[0]
    : (user?.firstName || 'Paciente')
  const [tab, setTab] = useState<Tab>('inicio')
  const [prevTab, setPrevTab] = useState<Tab>('inicio')
  const direction = getDirection(prevTab, tab)

  function switchTab(next: Tab) {
    setPrevTab(tab)
    setTab(next)
  }

  return (
    <div className="flex min-h-dvh justify-center bg-omega-abyss">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none fixed -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#7C3AED] opacity-[0.12] blur-[120px]"
        style={{ animation: 'float-orb 20s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none fixed -bottom-32 -right-32 h-[350px] w-[350px] rounded-full bg-[#7FFFD4] opacity-[0.08] blur-[120px]"
        style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
      />
      <div
        className="pointer-events-none fixed right-[10%] top-[40%] h-[250px] w-[250px] rounded-full bg-[#EC4899] opacity-[0.06] blur-[100px]"
        style={{ animation: 'float-orb 18s ease-in-out infinite 5s' }}
      />

      {/* Mobile app container */}
      <div className="relative flex w-full max-w-md flex-col">
        {/* Header */}
        <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] bg-omega-abyss/70 px-5 py-3.5 backdrop-blur-xl">
          {doctorPreview ? (
            <>
              <button
                onClick={onBack}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                <ArrowLeft size={16} />
                Volver
              </button>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-omega-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-omega-violet">
                  Vista Doctor
                </span>
                <p className="text-sm text-white/50">
                  <span className="font-semibold text-beta-mint">{firstName}</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <img src="/beta-logo.png" alt="Beta Life" className="h-7 w-auto object-contain" />
                <div className="h-4 w-px bg-white/[0.08]" />
                <span className="text-[10px] font-bold tracking-widest text-white/30">BETA LIFE</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMonochrome}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-90 ${
                    monochrome
                      ? 'bg-white/10 text-white'
                      : 'bg-white/[0.04] text-white/40'
                  }`}
                  title={monochrome ? 'Modo Color' : 'Blanco y Negro'}
                >
                  <Palette size={16} />
                </button>
                <p className="text-sm text-white/50">
                  Hola, <span className="font-semibold text-beta-mint">{firstName}</span>
                </p>
              </div>
            </>
          )}
        </header>

        {/* Content area */}
        <main className="relative flex-1 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={tab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              className="absolute inset-0 overflow-y-auto px-5 pb-24 pt-5"
            >
              {tab === 'inicio' && (
                <TabInicio
                  clinic={clinic}
                  onGoToCitas={() => switchTab('citas')}
                  onGoToSalud={() => switchTab('salud')}
                  onGoToPerfil={() => switchTab('perfil')}
                />
              )}
              {tab === 'salud' && <TabSalud clinic={clinic} />}
              {tab === 'citas' && (
                <TabCitas
                  appointments={appointments}
                  addAppointment={addAppointment}
                  userName={doctorPreview && previewPatient ? previewPatient.nombre : (user?.fullName || user?.firstName || 'Paciente Portal')}
                  doctorPreview={doctorPreview}
                  previewPatientId={previewPatient?.id}
                />
              )}
              {tab === 'perfil' && (
                <TabPerfil
                  user={user}
                  signOut={signOut}
                  healthData={healthData}
                  doctorPreview={doctorPreview}
                  previewPatientName={previewPatient?.nombre}
                  previewPatientEmail={previewPatient?.email}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-white/[0.06] bg-omega-abyss/90 backdrop-blur-xl">
          <div className="flex items-center justify-around px-2 pb-1 pt-2">
            {TAB_CONFIG.map(({ key, label, icon: Icon }) => {
              const isActive = tab === key
              return (
                <button
                  key={key}
                  onClick={() => switchTab(key)}
                  className={`relative flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-beta-mint' : 'text-white/30 active:text-white/50'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute -top-2.5 h-[3px] w-6 rounded-full bg-beta-mint shadow-[0_0_8px_rgba(127,255,212,0.4)]"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon size={22} strokeWidth={1.75} />
                  {label}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: INICIO
   ══════════════════════════════════════════════════════════ */

function TabInicio({
  clinic,
  onGoToCitas,
  onGoToSalud,
  onGoToPerfil,
}: {
  clinic: { telefono: string; direccion: string }
  onGoToCitas: () => void
  onGoToSalud: () => void
  onGoToPerfil: () => void
}) {
  const appointment = useMemo(() => getNextAppointment(), [])
  const countdown = useCountdown(appointment.targetMs)
  const tipIndex = useMemo(() => Math.floor(Math.random() * healthTips.length), [])

  const profileCompletion = 65

  const quickActions = [
    { label: 'Agendar Cita', icon: CalendarPlus, color: 'text-beta-mint', bg: 'bg-beta-mint/15', action: onGoToCitas },
    { label: 'Mi Salud', icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-500/15', action: onGoToSalud },
    { label: 'Llamar Clínica', icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-500/15', action: () => window.open(`tel:${clinic.telefono.replace(/\D/g, '')}`, '_self') },
    { label: 'Ubicación', icon: MapPin, color: 'text-amber-400', bg: 'bg-amber-500/15', action: () => window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic.direccion)}`, '_blank') },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      {/* Next Appointment Card */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-beta-mint/[0.04] to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <CalendarClock size={16} className="text-beta-mint" />
          <h2 className="text-sm font-bold text-white">Tu Próxima Cita</h2>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-beta-mint/15">
              <Stethoscope size={20} className="text-beta-mint" />
            </div>
            <div>
              <p className="font-semibold text-white">{appointment.doctor}</p>
              <p className="text-xs text-white/40">{appointment.especialidad}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <CalendarClock size={13} />
              {appointment.fechaDisplay} · {appointment.hora}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {appointment.lugar}
            </span>
          </div>

          {!countdown.passed && (
            <div className="mt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-white/30">
                <Clock size={12} />
                Cuenta regresiva
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: countdown.days, label: 'Días' },
                  { value: countdown.hours, label: 'Horas' },
                  { value: countdown.minutes, label: 'Min' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-xl bg-white/[0.05] py-2.5 text-center">
                    <p className="text-2xl font-bold tabular-nums text-beta-mint">{value}</p>
                    <p className="text-[10px] font-medium text-white/30">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {countdown.passed && (
            <div className="mt-4">
              <button
                onClick={onGoToCitas}
                className="block w-full rounded-xl bg-beta-mint py-3 text-center text-sm font-bold text-omega-abyss shadow-[0_0_15px_rgba(127,255,212,0.2)] transition-all active:scale-[0.98]"
              >
                Reservar Nueva Cita
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} custom={1}>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/30">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map(({ label, icon: Icon, color, bg, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 text-left backdrop-blur-sm transition-all active:bg-white/[0.08] active:scale-[0.98]"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <span className="text-xs font-medium leading-tight text-white/70">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Health Profile Completion — Endowed Progress */}
      <motion.div
        variants={fadeUp}
        custom={2}
        className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Perfil de Salud</p>
            <p className="mt-0.5 text-xs text-white/40">
              Completa tu perfil para una mejor atención
            </p>
          </div>
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/[0.08]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-beta-mint"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${profileCompletion}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-bold text-beta-mint">{profileCompletion}%</span>
          </div>
        </div>
        <button
          onClick={onGoToPerfil}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-beta-mint transition-colors active:text-beta-mint/70"
        >
          Completar <ChevronRight size={14} />
        </button>
      </motion.div>

      {/* Health tip — Reciprocity */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-beta-mint/[0.06] to-transparent p-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-beta-mint" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-beta-mint/60">Tip diario</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          {healthTips[tipIndex]}
        </p>
      </motion.div>

      {/* Trust banner — Authority */}
      <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-4 py-2 text-[11px] text-white/20">
        <span className="flex items-center gap-1.5">
          <Lock size={10} />
          Cifrado E2E
        </span>
        <span>·</span>
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={10} />
          HIPAA Ready
        </span>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: SALUD
   ══════════════════════════════════════════════════════════ */

function TabSalud({ clinic }: { clinic: { nombre: string; nit: string; telefono: string; direccion: string } }) {
  const [expandedRx, setExpandedRx] = useState<number | null>(null)
  const [showAllTimeline, setShowAllTimeline] = useState(false)

  const visibleTimeline = showAllTimeline ? mockTimeline : mockTimeline.slice(0, 4)

  const vaccApplied = vaccinations.filter((v) => v.aplicada).length
  const vaccTotal = vaccinations.length
  const vaccPercent = Math.round((vaccApplied / vaccTotal) * 100)
  const vaccPending = vaccTotal - vaccApplied

  const typeIcon: Record<TimelineEvent['tipo'], typeof Activity> = {
    consulta: Stethoscope,
    laboratorio: Activity,
    receta: Pill,
    vacuna: Syringe,
  }

  const typeColor: Record<TimelineEvent['tipo'], string> = {
    consulta: 'text-beta-mint bg-beta-mint/15',
    laboratorio: 'text-blue-400 bg-blue-400/15',
    receta: 'text-amber-400 bg-amber-400/15',
    vacuna: 'text-emerald-400 bg-emerald-400/15',
  }

  function formatFecha(iso: string) {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('es-GT', { day: 'numeric', month: 'short' })
  }

  function handlePDF(rx: Receta) {
    generateRecetaPDF(rx, clinic.nombre, clinic.nit, clinic.telefono, clinic.direccion)
  }

  function handleFarmacia(rx: Receta) {
    const meds = rx.medicamentos.map((m) => `• ${m.nombre} — ${m.dosis}, ${m.frecuencia}, ${m.duracion}`).join('\n')
    const msg = `Hola, quisiera solicitar los siguientes medicamentos de mi receta:\n\n${meds}\n\nReceta del ${rx.fecha} — ${rx.doctor}\nDiagnóstico: ${rx.diagnostico}\n\nGracias.`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-xl font-bold text-white">Mi Salud</h1>
        <p className="mt-0.5 text-xs text-white/40">Historial médico y documentos</p>
      </motion.div>

      {/* ── Timeline ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={1}>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/30">
          Línea de Tiempo
        </h3>
        <div className="space-y-0.5">
          {visibleTimeline.map((ev, i) => {
            const Icon = typeIcon[ev.tipo]
            const color = typeColor[ev.tipo]
            const isLast = i === visibleTimeline.length - 1
            return (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                    <Icon size={14} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-white/[0.06]" />}
                </div>
                <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-4'}`}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-white/80">{ev.titulo}</p>
                    <span className="shrink-0 text-[10px] text-white/25">{formatFecha(ev.fecha)}</span>
                  </div>
                  <p className="text-xs text-white/40">{ev.doctor}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{ev.detalle}</p>
                </div>
              </div>
            )
          })}
        </div>
        {mockTimeline.length > 4 && (
          <button
            onClick={() => setShowAllTimeline(!showAllTimeline)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-beta-mint transition-colors active:text-beta-mint/70"
          >
            {showAllTimeline ? 'Ver menos' : `Ver todo (${mockTimeline.length})`}
            {showAllTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </motion.div>

      {/* ── Prescriptions ────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={2}>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/30">
          Recetas Médicas
        </h3>
        <div className="space-y-2.5">
          {prescriptions.map((rx) => {
            const isExpanded = expandedRx === rx.id
            return (
              <div key={rx.id} className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
                <button
                  onClick={() => setExpandedRx(isExpanded ? null : rx.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-white/[0.08]"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    rx.estado === 'activa' ? 'bg-beta-mint/15' : 'bg-white/[0.05]'
                  }`}>
                    <FileText size={16} className={rx.estado === 'activa' ? 'text-beta-mint' : 'text-white/30'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">{rx.diagnostico}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        rx.estado === 'activa'
                          ? 'bg-beta-mint/15 text-beta-mint'
                          : 'bg-white/[0.05] text-white/30'
                      }`}>
                        {rx.estado}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-white/40">{rx.doctor} · {rx.fecha}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.06]">
                    <div className="space-y-2 p-4">
                      {rx.medicamentos.map((m, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl bg-white/[0.05] p-3">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-beta-mint/10">
                            <Pill size={12} className="text-beta-mint" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/80">{m.nombre}</p>
                            <p className="text-xs text-white/40">{m.dosis} · {m.frecuencia} · {m.duracion}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 border-t border-white/[0.06] px-4 py-3">
                      <button
                        onClick={() => handlePDF(rx)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-beta-mint/30 bg-beta-mint/[0.08] py-2.5 text-xs font-semibold text-beta-mint transition-colors active:bg-beta-mint/20"
                      >
                        <Download size={14} />
                        PDF
                      </button>
                      <button
                        onClick={() => handleFarmacia(rx)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] py-2.5 text-xs font-semibold text-emerald-400 transition-colors active:bg-emerald-500/20"
                      >
                        <WaIcon size={14} />
                        Farmacia
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Vaccination Progress — Goal-Gradient ──────────── */}
      <motion.div variants={fadeUp} custom={3}>
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-white/30">
          Vacunación
        </h3>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-semibold text-white/80">Progreso</p>
            <span className="text-sm font-bold text-beta-mint">{vaccPercent}%</span>
          </div>
          <p className="mb-3 text-xs text-white/40">
            {vaccPending > 0
              ? `Falta${vaccPending > 1 ? 'n' : ''} ${vaccPending} vacuna${vaccPending > 1 ? 's' : ''} para completar tu esquema`
              : 'Esquema de vacunación completo'}
          </p>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-beta-mint to-emerald-400 transition-all"
              style={{ width: `${vaccPercent}%` }}
            />
          </div>

          <div className="space-y-2">
            {vaccinations.map((v, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                  v.aplicada ? 'bg-emerald-500/15' : 'bg-white/[0.05]'
                }`}>
                  {v.aplicada ? (
                    <CheckCircle2 size={14} className="text-emerald-400" />
                  ) : (
                    <Syringe size={14} className="text-white/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${v.aplicada ? 'text-white/70' : 'text-white/40'}`}>
                    {v.nombre}
                  </p>
                </div>
                <span className={`text-[10px] ${v.aplicada ? 'text-white/30' : 'text-amber-400'}`}>
                  {v.aplicada ? v.fecha : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Diet tip card ────────────────────────────────── */}
      <motion.div variants={fadeUp} custom={4} className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Salad size={16} className="text-emerald-400" />
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/60">Plan Nutricional</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Tu próximo control nutricional está programado. Recuerda llevar tu registro de alimentación semanal.
        </p>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: CITAS
   ══════════════════════════════════════════════════════════ */

function TabCitas({
  appointments,
  addAppointment,
  userName,
  doctorPreview,
  previewPatientId,
}: {
  appointments: AgendaAppointment[]
  addAppointment: (data: Omit<AgendaAppointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  userName: string
  doctorPreview?: boolean
  previewPatientId?: number
}) {
  const [showBooking, setShowBooking] = useState(false)

  const myAppointments = doctorPreview && previewPatientId
    ? appointments.filter((a) => a.patientId === previewPatientId)
    : appointments.filter((a) =>
        a.patientName.toLowerCase().includes('paciente') ||
        a.patientName === userName ||
        a.estado === 'confirmada' ||
        a.estado === 'pendiente',
      )

  const statusColor: Record<string, string> = {
    confirmada: 'bg-emerald-500/15 text-emerald-400',
    pendiente: 'bg-amber-500/15 text-amber-400',
    cancelada: 'bg-red-500/15 text-red-400',
    completada: 'bg-blue-500/15 text-blue-400',
    no_show: 'bg-slate-500/15 text-slate-400',
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mis Citas</h1>
          <p className="mt-0.5 text-xs text-white/40">Historial y reservas</p>
        </div>
      </motion.div>

      {/* Booking wizard */}
      {!doctorPreview && showBooking && (
        <PortalBookingWizard
          addAppointment={addAppointment}
          userName={userName}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* Appointment list */}
      {!showBooking && (
        <>
          <motion.div variants={fadeUp} custom={1} className="space-y-2.5">
            {myAppointments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/[0.08] py-12 text-center">
                <CalendarDays size={32} className="mx-auto text-white/20" />
                <p className="mt-2 text-sm text-white/40">No tienes citas registradas</p>
              </div>
            )}
            {myAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-beta-mint/15">
                  <Stethoscope size={18} className="text-beta-mint" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{a.doctor}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {a.hora}
                    </span>
                    <span>·</span>
                    <span>{a.patientName}</span>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColor[a.estado] ?? 'bg-white/[0.05] text-white/30'}`}>
                  {a.estado}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Sync indicator — Social Proof */}
          <motion.div variants={fadeUp} custom={2} className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.08] py-4">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <p className="text-xs text-white/40">
              Sincronizado en tiempo real con el calendario de la clínica
            </p>
          </motion.div>
        </>
      )}

      {/* FAB */}
      {!doctorPreview && !showBooking && (
        <button
          onClick={() => setShowBooking(true)}
          className="fixed bottom-20 right-1/2 z-10 flex h-14 w-14 translate-x-[calc(min(256px,50vw)-2rem)] items-center justify-center rounded-full bg-beta-mint shadow-[0_0_20px_rgba(127,255,212,0.25)] transition-all active:scale-95"
        >
          <Plus size={24} className="text-omega-abyss" strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  )
}

/* ── Portal Booking Wizard (3-step, specialty-based) ───── */

function PortalBookingWizard({
  addAppointment,
  userName,
  onClose,
}: {
  addAppointment: (data: Omit<AgendaAppointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  userName: string
  onClose: () => void
}) {
  const [step, setStep] = useState(1)
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyConfig | null>(null)
  const [motivo, setMotivo] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const days = useMemo(() => getNext14Days(), [])
  const occupied = useMemo(
    () => (selectedDate ? getOccupied(selectedDate) : new Set<string>()),
    [selectedDate],
  )
  const selectedDayInfo = days.find((d) => d.iso === selectedDate)

  const themeColor = selectedSpecialty?.color || '#7C3AED'
  const themeAccent = selectedSpecialty?.accent || '#7FFFD4'

  function handleConfirm() {
    if (!selectedSpecialty || !selectedDate || !selectedTime) return

    addAppointment({
      patientId: 0,
      patientName: userName,
      fecha: selectedDate,
      hora: selectedTime,
      duracion: 30,
      tipo: 'consulta',
      doctor: selectedSpecialty.doctor,
      estado: 'pendiente',
    })

    setShowSuccess(true)
    toast.success('Cita agendada exitosamente')
    setTimeout(() => onClose(), 2500)
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center"
        >
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${themeAccent}20` }}
          >
            <CheckCircle2 size={44} style={{ color: themeAccent }} strokeWidth={2} />
          </div>
          <h2 className="text-lg font-bold text-white">Cita Confirmada</h2>
          <p className="mt-1.5 text-sm text-white/50">
            {capitalize(selectedDayInfo?.fullLabel ?? '')} a las {selectedTime}
          </p>
          <p className="mt-1 text-xs text-white/30">
            {selectedSpecialty?.label} — {selectedSpecialty?.doctor}
          </p>
          {/* WhatsApp share */}
          <button
            onClick={() => {
              const msg = `Hola! Acabo de agendar una cita:\n\n${selectedSpecialty?.label}\n${selectedSpecialty?.doctor}\n${capitalize(selectedDayInfo?.fullLabel ?? '')} a las ${selectedTime}\n\nAgendado en Beta Clinic`
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
            }}
            className="mx-auto mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] px-4 py-2 text-xs font-semibold text-emerald-400 transition-colors active:bg-emerald-500/20"
          >
            <MessageCircle size={14} />
            Compartir por WhatsApp
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-lg p-1.5 text-white/40 transition-colors active:bg-white/[0.08]"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold text-white">Agendar Cita</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/40 transition-colors active:bg-white/[0.08]"
        >
          <X size={20} />
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: s <= step ? themeAccent : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* Step 1: Specialty + Motivo */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/30">
            Especialidad
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SPECIALTY_DATA.map((spec) => {
              const isActive = selectedSpecialty?.key === spec.key
              return (
                <button
                  key={spec.key}
                  onClick={() => { setSelectedSpecialty(spec); setMotivo('') }}
                  className="flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all active:scale-[0.98]"
                  style={{
                    borderColor: isActive ? `${spec.accent}50` : 'rgba(255,255,255,0.06)',
                    backgroundColor: isActive ? `${spec.color}15` : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <span className="text-xl">{spec.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: isActive ? spec.accent : 'rgba(255,255,255,0.7)' }}>
                      {spec.label}
                    </p>
                    <p className="text-[10px] text-white/30">{spec.doctor}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedSpecialty && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Motivo de consulta
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedSpecialty.motivos.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMotivo(m)}
                    className="rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
                    style={{
                      borderColor: motivo === m ? `${themeAccent}50` : 'rgba(255,255,255,0.06)',
                      backgroundColor: motivo === m ? `${themeColor}15` : 'rgba(255,255,255,0.03)',
                      color: motivo === m ? themeAccent : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {selectedSpecialty && motivo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setStep(2)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: themeAccent, color: '#0B0613' }}
              >
                Continuar
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 2: Date + Time */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Date carousel */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Fecha
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
                  className="rounded-lg border border-white/[0.06] p-1 text-white/30 transition-colors active:bg-white/[0.08]"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                  className="rounded-lg border border-white/[0.06] p-1 text-white/30 transition-colors active:bg-white/[0.08]"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2"
              style={{ scrollbarWidth: 'none' }}
            >
              {days.map((d) => {
                const isActive = selectedDate === d.iso
                return (
                  <button
                    key={d.iso}
                    onClick={() => { setSelectedDate(d.iso); setSelectedTime('') }}
                    className="flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-all"
                    style={{
                      borderColor: isActive ? `${themeAccent}50` : 'rgba(255,255,255,0.06)',
                      backgroundColor: isActive ? `${themeColor}15` : 'rgba(255,255,255,0.03)',
                      color: isActive ? themeAccent : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">{d.dayName}</span>
                    <span className="mt-0.5 text-xl font-bold leading-none">{d.dayNum}</span>
                    <span className="mt-1 text-[10px] font-medium uppercase opacity-50">{d.monthLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-white/30">
                Hora
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ALL_SLOTS.map((slot) => {
                  const isOccupied = occupied.has(slot)
                  const isSelected = selectedTime === slot
                  return (
                    <button
                      key={slot}
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(slot)}
                      className="rounded-xl border py-2.5 text-xs font-semibold transition-all"
                      style={{
                        borderColor: isSelected ? `${themeAccent}50` : isOccupied ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                        backgroundColor: isSelected ? `${themeColor}15` : isOccupied ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
                        color: isSelected ? themeAccent : isOccupied ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)',
                        textDecoration: isOccupied ? 'line-through' : 'none',
                      }}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {selectedDate && selectedTime && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <button
                onClick={() => setStep(3)}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all active:scale-[0.98]"
                style={{ backgroundColor: themeAccent, color: '#0B0613' }}
              >
                Continuar
                <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {!selectedDate && (
            <div className="rounded-2xl border border-dashed border-white/[0.08] py-10 text-center">
              <CalendarClock size={28} className="mx-auto text-white/20" />
              <p className="mt-2 text-xs text-white/40">Selecciona una fecha para ver horarios</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && selectedSpecialty && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div
            className="overflow-hidden rounded-2xl border"
            style={{ borderColor: `${themeAccent}30` }}
          >
            <div className="border-b px-4 py-2.5" style={{ borderColor: `${themeAccent}15` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Resumen de tu cita</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${themeColor}20` }}
                >
                  <span className="text-2xl">{selectedSpecialty.emoji}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{selectedSpecialty.doctor}</p>
                  <p className="text-xs" style={{ color: themeAccent }}>{selectedSpecialty.label}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.05] p-3">
                <div className="flex items-center gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5">
                    <CalendarClock size={13} />
                    {capitalize(selectedDayInfo?.fullLabel ?? '')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    {selectedTime}
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Motivo: <span className="text-white/60">{motivo}</span>
                </p>
              </div>
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={handleConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: themeAccent,
                  color: '#0B0613',
                  boxShadow: `0 0 20px ${themeAccent}30`,
                }}
              >
                <CalendarPlus size={18} />
                Confirmar Cita
              </button>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-3 text-[10px] text-white/20">
            <span className="flex items-center gap-1">
              <ShieldCheck size={10} />
              Confirmación inmediata
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Lock size={10} />
              Datos protegidos
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   TAB: PERFIL
   ══════════════════════════════════════════════════════════ */

function TabPerfil({
  user,
  signOut,
  healthData,
  doctorPreview,
  previewPatientName,
  previewPatientEmail,
}: {
  user: ReturnType<typeof useUser>['user']
  signOut: ReturnType<typeof useClerk>['signOut']
  healthData: PatientHealthData
  doctorPreview?: boolean
  previewPatientName?: string
  previewPatientEmail?: string
}) {
  const patientId = doctorPreview ? 'PREVIEW' : (user?.id ?? 'UNKNOWN')
  const displayName = doctorPreview && previewPatientName ? previewPatientName : (user?.fullName || 'Paciente')
  const displayEmail = doctorPreview ? (previewPatientEmail || '') : (user?.primaryEmailAddress?.emailAddress || '')
  const nameParts = displayName.split(' ')
  const initials = doctorPreview
    ? (nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')
    : user
      ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
      : '?'

  const healthCards = [
    { icon: Droplets, label: 'Tipo de Sangre', value: healthData.tipoSangre, color: 'text-red-400 bg-red-400/15' },
    { icon: AlertCircle, label: 'Alergias', value: healthData.alergias.join(', '), color: 'text-amber-400 bg-amber-400/15' },
    { icon: Shield, label: 'Seguro Médico', value: healthData.seguro, color: 'text-blue-400 bg-blue-400/15' },
    { icon: Heart, label: 'Género', value: healthData.genero, color: 'text-pink-400 bg-pink-400/15' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-5">
      {/* ── Digital Credential Card ────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={0}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent backdrop-blur-sm"
      >
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full border-[6px] border-beta-mint" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full border-[6px] border-beta-mint" />
        </div>

        <div className="relative flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <Fingerprint size={14} className="text-beta-mint" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-beta-mint">
            Carnet Digital — Beta Life
          </span>
        </div>

        <div className="relative p-4 space-y-3">
          <div className="flex items-center gap-3">
            {!doctorPreview && user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? ''}
                className="h-16 w-16 rounded-2xl border-2 border-beta-mint/30 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-beta-mint/15 text-xl font-bold text-beta-mint">
                {initials}
              </div>
            )}
            <div>
              <h1 className="text-base font-bold text-white">
                {displayName}
              </h1>
              <p className="text-[11px] text-white/40">
                {displayEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Sangre</p>
              <p className="text-sm font-bold text-red-400">{healthData.tipoSangre}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Alergias</p>
              <p className="text-sm font-bold text-amber-400">{healthData.alergias.join(', ')}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Seguro</p>
              <p className="text-sm font-bold text-blue-400">{healthData.seguro}</p>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/[0.06] px-4 py-2">
          <p className="font-mono text-[9px] text-white/20">
            ID: {patientId.slice(0, 20)}
          </p>
        </div>
      </motion.div>

      {/* Authority badges */}
      <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center gap-4 text-[10px] text-white/20">
        <span className="flex items-center gap-1">
          <Lock size={10} />
          Datos protegidos
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={10} />
          Cifrado E2E
        </span>
        <span>·</span>
        <span>HIPAA Ready</span>
      </motion.div>

      {/* ── Health Info Grid ───────────────────────────── */}
      <motion.div variants={fadeUp} custom={2}>
        <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
          Información de Salud
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {healthCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3.5 backdrop-blur-sm"
            >
              <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-white/80">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Social proof */}
      <motion.div variants={fadeUp} custom={3} className="text-center">
        <p className="text-[10px] text-white/20">
          340+ profesionales confían en Beta Clinic
        </p>
      </motion.div>

      {/* ── Account ────────────────────────────────────── */}
      {!doctorPreview && (
        <motion.div variants={fadeUp} custom={5}>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
            Cuenta
          </h3>
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <button
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/[0.08]"
            >
              <LogOut size={18} className="text-red-400" />
              <span className="flex-1 text-sm font-medium text-red-400">Cerrar Sesión</span>
              <ChevronRight size={16} className="text-white/20" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
