import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Bell,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  Stethoscope,
  SmilePlus,
  Baby,
  Apple,
  Search,
  Zap,
  History,
  Settings2,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import { useClinic, type ClinicType } from '../context/ClinicContext'
import {
  openWhatsApp as openWa,
  formatGuatemalaPhone,
  displayPhone,
  trackMessage,
} from '../services/whatsapp'

/* ── Types ─────────────────────────────────────────────── */

type ReminderStatus = 'pendiente' | 'enviando' | 'enviado' | 'error'

interface ReminderRow {
  id: string
  patient: string
  phone: string
  time: string
  doctor: string
  specialty: ClinicType
  message: string
  status: ReminderStatus
  sentAt?: string
}

type ViewTab = 'pendientes' | 'historial'

/* ── Specialty config ─────────────────────────────────── */

interface SpecialtyMeta {
  label: string
  icon: LucideIcon
  color: string
  bg: string
  border: string
  emoji: string
}

const SPECIALTY_META: Record<ClinicType, SpecialtyMeta> = {
  dental: {
    label: 'Odontología',
    icon: SmilePlus,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/20',
    emoji: '🦷',
  },
  pediatrics: {
    label: 'Pediatría',
    icon: Baby,
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/20',
    emoji: '👶',
  },
  nutrition: {
    label: 'Nutrición',
    icon: Apple,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/20',
    emoji: '🥗',
  },
  general: {
    label: 'General',
    icon: Stethoscope,
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
    border: 'border-violet-500/20',
    emoji: '🩺',
  },
}

/* ── Message templates ────────────────────────────────── */

const TEMPLATES: Record<ClinicType, (name: string, time: string) => string> = {
  dental: (name, time) =>
    `Hola ${name}, recuerda tu limpieza mañana a las ${time}. Tu sonrisa te espera. 🦷✨\n\n— Beta Clinic`,
  pediatrics: (name, time) =>
    `Hola mamá/papá de ${name}, mañana toca revisión y vacunas a las ${time}. ¡No olviden su carné! 👶💉\n\n— Beta Clinic`,
  nutrition: (name, time) =>
    `Hola ${name}, mañana medimos tu progreso a las ${time}. ¡Recuerda traer tu registro de comidas! 🥗📋\n\n— Beta Clinic`,
  general: (name, time) =>
    `Hola ${name}, confirmamos tu consulta médica para mañana a las ${time}. 🩺\n\n— Beta Clinic`,
}

/* ── WhatsApp icon ────────────────────────────────────── */

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ── Mock upcoming appointments (simulate "tomorrow") ── */

function buildMockReminders(
  clinicType: ClinicType | null,
  patientPhones: Map<string, string>,
): ReminderRow[] {
  const specialty = clinicType ?? 'general'

  const upcoming: { patient: string; time: string; doctor: string; specialty: ClinicType }[] = [
    { patient: 'María García', time: '08:30 AM', doctor: 'Dr. Rodríguez', specialty: 'general' },
    { patient: 'Carlos López', time: '09:00 AM', doctor: 'Dra. Martínez', specialty: 'dental' },
    { patient: 'Ana Torres', time: '09:30 AM', doctor: 'Dr. Rodríguez', specialty },
    { patient: 'Sofía Mendoza', time: '10:00 AM', doctor: 'Dra. López', specialty: 'pediatrics' },
    { patient: 'Luis Ramírez', time: '10:30 AM', doctor: 'Lic. Herrera', specialty: 'nutrition' },
    { patient: 'Jorge Castillo', time: '11:00 AM', doctor: 'Dr. Herrera', specialty },
    { patient: 'Camila Herrera', time: '11:30 AM', doctor: 'Dr. Rodríguez', specialty: 'general' },
    { patient: 'Diego Vargas', time: '14:00 PM', doctor: 'Dra. Martínez', specialty: 'dental' },
  ]

  return upcoming.map((a, i) => {
    const phone = patientPhones.get(a.patient) ?? '50200000000'
    const template = TEMPLATES[a.specialty]
    return {
      id: `rem-${i}`,
      patient: a.patient,
      phone,
      time: a.time,
      doctor: a.doctor,
      specialty: a.specialty,
      message: template(a.patient.split(' ')[0], a.time),
      status: 'pendiente' as ReminderStatus,
    }
  })
}

/* ── Helpers ──────────────────────────────────────────── */

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function nowTimeStr() {
  return new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
}

/* ══════════════════════════════════════════════════════════
   REMINDER ROW COMPONENT
   ══════════════════════════════════════════════════════════ */

function ReminderRowCard({
  row,
  onSendIndividual,
  onPreview,
}: {
  row: ReminderRow
  onSendIndividual: (id: string) => void
  onPreview: (row: ReminderRow) => void
}) {
  const meta = SPECIALTY_META[row.specialty]
  const Icon = meta.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
        row.status === 'enviado'
          ? 'border-emerald-500/15 bg-emerald-500/[0.03]'
          : row.status === 'enviando'
            ? 'border-amber-500/15 bg-amber-500/[0.03]'
            : 'border-clinical-white/[0.06] bg-omega-abyss/40 hover:border-omega-violet/20 dark:hover:border-clinical-white/10'
      }`}
    >
      {/* Time */}
      <div className="w-16 shrink-0 text-center">
        <p className="text-sm font-bold tabular-nums text-omega-dark dark:text-clinical-white">{row.time.split(' ')[0]}</p>
        <p className="text-[10px] font-medium text-omega-dark/40 dark:text-clinical-white/30">{row.time.split(' ')[1]}</p>
      </div>

      {/* Divider */}
      <div className="h-10 w-px bg-clinical-white/[0.06]" />

      {/* Patient */}
      <div className="flex flex-1 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg} text-xs font-bold ${meta.color}`}>
          {getInitials(row.patient)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-omega-dark dark:text-clinical-white">{row.patient}</p>
          <p className="truncate text-[11px] text-omega-dark/40 dark:text-clinical-white/35">{row.doctor}</p>
        </div>
      </div>

      {/* Specialty badge */}
      <div className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 sm:flex ${meta.bg} ${meta.border}`}>
        <Icon size={12} className={meta.color} />
        <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
      </div>

      {/* Status / Actions */}
      <div className="flex items-center gap-1.5">
        {row.status === 'enviado' ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5">
            <CheckCheck size={14} className="text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-400">Enviado</span>
          </div>
        ) : row.status === 'enviando' ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Send size={14} className="text-amber-400" />
            </motion.div>
            <span className="text-[11px] font-semibold text-amber-400">Enviando...</span>
          </div>
        ) : (
          <>
            {/* Preview */}
            <button
              onClick={() => onPreview(row)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/25 transition-colors hover:border-omega-violet/20 hover:bg-omega-violet/10 hover:text-omega-violet dark:hover:text-beta-mint"
              title="Ver mensaje"
            >
              <MessageSquare size={14} />
            </button>

            {/* Send individual */}
            <button
              onClick={() => onSendIndividual(row.id)}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 text-[11px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/25"
              title={`Enviar a ${row.patient}`}
            >
              <WaIcon size={13} />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   MESSAGE PREVIEW MODAL
   ══════════════════════════════════════════════════════════ */

function PreviewModal({
  row,
  onClose,
  onSend,
}: {
  row: ReminderRow
  onClose: () => void
  onSend: () => void
}) {
  const meta = SPECIALTY_META[row.specialty]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-omega-violet/20 bg-omega-surface shadow-2xl dark:border-clinical-white/10"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-clinical-white/[0.06] px-5 py-3.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bg}`}>
            <MessageSquare size={16} className={meta.color} />
          </div>
          <div>
            <p className="text-sm font-bold text-clinical-white">Vista previa</p>
            <p className="text-[11px] text-clinical-white/40">{row.patient} · {row.time}</p>
          </div>
        </div>

        {/* Phone bubble */}
        <div className="p-5">
          <div className="rounded-2xl rounded-tl-md bg-emerald-600/20 p-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-clinical-white/80">
              {row.message}
            </p>
          </div>
          <p className="mt-2 text-right text-[10px] text-clinical-white/25">
            WhatsApp · {displayPhone(row.phone)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-clinical-white/[0.06] px-5 py-3.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-clinical-white/10 py-2.5 text-sm font-medium text-clinical-white/50 transition-colors hover:bg-clinical-white/5"
          >
            Cerrar
          </button>
          <button
            onClick={onSend}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
          >
            <WaIcon size={15} />
            Enviar
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SEND ALL PROGRESS
   ══════════════════════════════════════════════════════════ */

function SendAllProgress({
  total,
  current,
  currentName,
}: {
  total: number
  current: number
  currentName: string
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="overflow-hidden rounded-xl border border-omega-violet/20 bg-omega-surface dark:border-clinical-white/10"
    >
      <div className="flex items-center gap-3 px-5 py-3.5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-omega-violet/15"
        >
          <Send size={16} className="text-omega-violet dark:text-beta-mint" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-omega-dark dark:text-clinical-white">
              Enviando recordatorios...
            </p>
            <span className="text-xs font-bold tabular-nums text-omega-violet dark:text-beta-mint">
              {current}/{total}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-omega-dark/40 dark:text-clinical-white/35">
            {currentName}
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-omega-violet/10 dark:bg-clinical-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-omega-violet to-beta-mint"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function ReminderCenter() {
  const { patients } = useData()
  const { clinicType } = useClinic()

  /* ── Derive phone map ───────────────────────────────── */
  const phoneMap = useMemo(() => {
    const m = new Map<string, string>()
    patients.forEach((p) => {
      m.set(p.nombre, formatGuatemalaPhone(p.telefono))
    })
    return m
  }, [patients])

  /* ── State ──────────────────────────────────────────── */
  const [reminders, setReminders] = useState<ReminderRow[]>(() =>
    buildMockReminders(clinicType, phoneMap),
  )
  const [viewTab, setViewTab] = useState<ViewTab>('pendientes')
  const [searchQuery, setSearchQuery] = useState('')
  const [previewRow, setPreviewRow] = useState<ReminderRow | null>(null)
  const [filterSpecialty, setFilterSpecialty] = useState<ClinicType | 'all'>('all')

  // Config toggles
  const [remind24h, setRemind24h] = useState(true)
  const [remind1h, setRemind1h] = useState(false)
  const [showConfig, setShowConfig] = useState(false)

  // Send all state
  const [sendingAll, setSendingAll] = useState(false)
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0, name: '' })
  const sendCancelRef = useRef(false)

  /* ── Derived data ───────────────────────────────────── */

  const pending = useMemo(() => {
    let list = reminders.filter((r) => r.status === 'pendiente')
    if (filterSpecialty !== 'all') {
      list = list.filter((r) => r.specialty === filterSpecialty)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.patient.toLowerCase().includes(q) ||
          r.doctor.toLowerCase().includes(q),
      )
    }
    return list
  }, [reminders, filterSpecialty, searchQuery])

  const sent = useMemo(() => reminders.filter((r) => r.status === 'enviado'), [reminders])

  const stats = useMemo(() => {
    const total = reminders.length
    const enviados = reminders.filter((r) => r.status === 'enviado').length
    const pendientes = reminders.filter((r) => r.status === 'pendiente').length
    return { total, enviados, pendientes }
  }, [reminders])

  /* ── WhatsApp open ──────────────────────────────────── */

  const handleOpenWhatsApp = useCallback((phone: string, message: string) => {
    openWa(phone, message)
  }, [])

  /* ── Send individual ────────────────────────────────── */

  const handleSendIndividual = useCallback(
    (id: string) => {
      const row = reminders.find((r) => r.id === id)
      if (!row) return

      // Mark as enviando briefly
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'enviando' as ReminderStatus } : r)),
      )

      // Open WhatsApp
      handleOpenWhatsApp(row.phone, row.message)

      // Track message in localStorage
      trackMessage({
        phone: row.phone,
        pacienteId: 0,
        message: row.message,
        templateId: 'reminder-24h',
        status: 'enviado',
        sentAt: new Date().toISOString(),
        channel: 'wa_link',
      })

      // Mark as sent after 1.5s
      setTimeout(() => {
        setReminders((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: 'enviado' as ReminderStatus, sentAt: nowTimeStr() } : r,
          ),
        )
        toast.success(`Recordatorio enviado a ${row.patient}`)
      }, 1500)
    },
    [reminders, handleOpenWhatsApp],
  )

  /* ── Send from preview ──────────────────────────────── */

  function handleSendFromPreview() {
    if (!previewRow) return
    handleSendIndividual(previewRow.id)
    setPreviewRow(null)
  }

  /* ── Send ALL ───────────────────────────────────────── */

  async function handleSendAll() {
    const toSend = reminders.filter((r) => r.status === 'pendiente')
    if (toSend.length === 0) return

    setSendingAll(true)
    sendCancelRef.current = false
    setSendProgress({ current: 0, total: toSend.length, name: '' })

    for (let i = 0; i < toSend.length; i++) {
      if (sendCancelRef.current) break

      const row = toSend[i]
      setSendProgress({ current: i + 1, total: toSend.length, name: row.patient })

      // Mark as enviando
      setReminders((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, status: 'enviando' as ReminderStatus } : r)),
      )

      // Simulate send delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mark as sent
      setReminders((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, status: 'enviado' as ReminderStatus, sentAt: nowTimeStr() }
            : r,
        ),
      )
    }

    setSendingAll(false)

    if (!sendCancelRef.current) {
      toast.success(`${toSend.length} recordatorios enviados`)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sendCancelRef.current = true
    }
  }, [])

  /* ── Tomorrow label ─────────────────────────────────── */

  const tomorrowLabel = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const formatted = d.toLocaleDateString('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [])

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
            Centro de Recordatorios
          </h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            <Calendar size={13} className="mr-1 inline" />
            Citas para mañana — {tomorrowLabel}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Config toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              showConfig
                ? 'border-omega-violet/30 bg-omega-violet/10 text-omega-violet dark:border-beta-mint/30 dark:bg-beta-mint/10 dark:text-beta-mint'
                : 'border-omega-violet/20 text-omega-dark/40 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/30 dark:hover:bg-clinical-white/5'
            }`}
            title="Configuración"
          >
            <Settings2 size={16} />
          </button>

          {/* Send All */}
          <button
            onClick={handleSendAll}
            disabled={stats.pendientes === 0 || sendingAll}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-omega-violet to-beta-mint px-4 py-2 text-sm font-bold text-white shadow-md shadow-omega-violet/20 transition-all hover:shadow-lg hover:shadow-omega-violet/25 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            <Zap size={16} />
            Enviar Todos ({stats.pendientes})
          </button>
        </div>
      </div>

      {/* ── Config panel ───────────────────────────────── */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                Automatización
              </h3>
              <div className="flex flex-wrap gap-6">
                {/* 24h toggle */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={remind24h}
                      onChange={() => {
                        setRemind24h(!remind24h)
                        toast.success(!remind24h ? 'Recordatorio 24h activado' : 'Recordatorio 24h desactivado')
                      }}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-omega-dark/10 transition-colors peer-checked:bg-omega-violet dark:bg-clinical-white/10 dark:peer-checked:bg-beta-mint" />
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">24 horas antes</p>
                    <p className="text-[11px] text-omega-dark/40 dark:text-clinical-white/30">Enviar recordatorio el día anterior</p>
                  </div>
                </label>

                {/* 1h toggle */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={remind1h}
                      onChange={() => {
                        setRemind1h(!remind1h)
                        toast.success(!remind1h ? 'Recordatorio 1h activado' : 'Recordatorio 1h desactivado')
                      }}
                      className="peer sr-only"
                    />
                    <div className="h-6 w-11 rounded-full bg-omega-dark/10 transition-colors peer-checked:bg-omega-violet dark:bg-clinical-white/10 dark:peer-checked:bg-beta-mint" />
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">1 hora antes</p>
                    <p className="text-[11px] text-omega-dark/40 dark:text-clinical-white/30">Recordatorio de última hora</p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Send All progress ──────────────────────────── */}
      <AnimatePresence>
        {sendingAll && (
          <SendAllProgress
            total={sendProgress.total}
            current={sendProgress.current}
            currentName={sendProgress.name}
          />
        )}
      </AnimatePresence>

      {/* ── Stats bar ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Bell, color: 'text-omega-violet dark:text-beta-mint', bg: 'bg-omega-violet/10 dark:bg-beta-mint/10', border: 'border-omega-violet/20 dark:border-beta-mint/20' },
          { label: 'Pendientes', value: stats.pendientes, icon: Clock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Enviados', value: stats.enviados, icon: CheckCheck, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${bg} ${border}`}
          >
            <Icon size={14} className={color} />
            <span className={`text-base font-bold tabular-nums ${color}`}>{value}</span>
            <span className={`text-xs font-medium ${color} opacity-70`}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Tabs + Filters ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* View tabs */}
        <div className="flex gap-1 rounded-lg border border-omega-violet/20 p-0.5 dark:border-clinical-white/10">
          {([
            { key: 'pendientes' as ViewTab, label: 'Pendientes', icon: Bell },
            { key: 'historial' as ViewTab, label: 'Enviados Hoy', icon: History },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewTab(key)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewTab === key
                  ? 'bg-omega-violet/10 text-omega-dark dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/40 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {viewTab === 'pendientes' && (
          <div className="flex items-center gap-2">
            {/* Specialty filter */}
            <div className="relative">
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value as ClinicType | 'all')}
                className="appearance-none rounded-lg border border-omega-violet/20 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-omega-dark outline-none transition-colors focus:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
              >
                <option value="all">Todas</option>
                <option value="general">General</option>
                <option value="dental">Dental</option>
                <option value="pediatrics">Pediatría</option>
                <option value="nutrition">Nutrición</option>
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-omega-dark/30 dark:text-clinical-white/30" />
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-omega-dark/25 dark:text-clinical-white/25" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar paciente..."
                className="w-40 rounded-lg border border-omega-violet/20 bg-white py-1.5 pl-9 pr-3 text-xs text-omega-dark outline-none transition-colors focus:border-omega-violet/40 placeholder:text-omega-dark/25 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/25"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Content ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {viewTab === 'pendientes' ? (
          <motion.div
            key="pendientes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-omega-violet/20 py-16 text-center dark:border-clinical-white/10">
                <CheckCheck size={40} className="mx-auto text-emerald-400/40" />
                <p className="mt-3 text-sm font-medium text-omega-dark/40 dark:text-clinical-white/30">
                  {stats.pendientes === 0
                    ? 'Todos los recordatorios fueron enviados'
                    : 'No hay resultados para tu búsqueda'}
                </p>
              </div>
            ) : (
              pending.map((row) => (
                <ReminderRowCard
                  key={row.id}
                  row={row}
                  onSendIndividual={handleSendIndividual}
                  onPreview={setPreviewRow}
                />
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="historial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {sent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-omega-violet/20 py-16 text-center dark:border-clinical-white/10">
                <History size={40} className="mx-auto text-omega-dark/15 dark:text-clinical-white/15" />
                <p className="mt-3 text-sm font-medium text-omega-dark/40 dark:text-clinical-white/30">
                  Aún no has enviado recordatorios hoy
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-omega-violet/20 dark:border-clinical-white/10">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                      <th className="px-4 py-2.5 text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40">Hora Envío</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40">Paciente</th>
                      <th className="hidden px-4 py-2.5 text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40 sm:table-cell">Especialidad</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40">Cita</th>
                      <th className="px-4 py-2.5 text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sent.map((r) => {
                      const meta = SPECIALTY_META[r.specialty]
                      const Icon = meta.icon
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-omega-violet/5 last:border-0 dark:border-clinical-white/5"
                        >
                          <td className="px-4 py-3 text-xs tabular-nums text-omega-dark/50 dark:text-clinical-white/40">
                            {r.sentAt ?? '—'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${meta.bg} text-[10px] font-bold ${meta.color}`}>
                                {getInitials(r.patient)}
                              </div>
                              <span className="text-sm font-medium text-omega-dark dark:text-clinical-white">{r.patient}</span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${meta.bg} ${meta.border}`}>
                              <Icon size={10} className={meta.color} />
                              <span className={`text-[10px] font-semibold ${meta.color}`}>{meta.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-omega-dark/60 dark:text-clinical-white/50">
                            {r.time}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 dark:text-emerald-400">
                              <Check size={10} />
                              Enviado
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preview modal ──────────────────────────────── */}
      <AnimatePresence>
        {previewRow && (
          <PreviewModal
            row={previewRow}
            onClose={() => setPreviewRow(null)}
            onSend={handleSendFromPreview}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
