import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Package,
  Truck,
  CheckCircle2,
  BadgeDollarSign,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertTriangle,
  User,
  FlaskConical,
  Search,
  Wrench,
} from 'lucide-react'
import { useData } from '../../context/DataContext'
import { useDentalLabs } from '../../hooks/useDentalLabs'
import { useLabOrders, type FrontendLabOrder, type FrontendLabStatus } from '../../hooks/useLabOrders'
import LabDirectory from './LabDirectory'

/* ── Types ─────────────────────────────────────────────── */

type LabStatus = FrontendLabStatus
type LabOrder = FrontendLabOrder

/* ── Column config ────────────────────────────────────── */

interface ColumnConfig {
  key: LabStatus
  label: string
  emoji: string
  icon: typeof Package
  gradient: string
  badge: string
}

const COLUMNS: ColumnConfig[] = [
  {
    key: 'por_enviar',
    label: 'Por Enviar',
    emoji: '📝',
    icon: Package,
    gradient: 'from-cyan-500/20 to-cyan-500/5',
    badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  },
  {
    key: 'enviado',
    label: 'En Proceso',
    emoji: '🚚',
    icon: Truck,
    gradient: 'from-amber-500/20 to-amber-500/5',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  {
    key: 'recibido',
    label: 'Recibido',
    emoji: '✅',
    icon: CheckCircle2,
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  {
    key: 'entregado',
    label: 'Entregado',
    emoji: '💰',
    icon: BadgeDollarSign,
    gradient: 'from-violet-500/20 to-violet-500/5',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  },
]

/* ── Shade guide colors ───────────────────────────────── */

const SHADE_GUIDE: Record<string, string> = {
  A1: '#F5E6D3',
  A2: '#E8D5B8',
  A3: '#DBBC8E',
  'A3.5': '#C9A76E',
  A4: '#B08C4A',
  B1: '#F0E2C8',
  B2: '#E0CCA0',
  B3: '#CCB47A',
  C1: '#E8D8C0',
  C2: '#D4C098',
  D2: '#D0C0A0',
  D3: '#BCA878',
  BL1: '#FAFAF5',
  BL2: '#F2F0E8',
}

const SHADE_OPTIONS = Object.keys(SHADE_GUIDE)

/* ── Work types ───────────────────────────────────────── */

const WORK_TYPES = [
  'Corona Zirconia',
  'Corona Metal-Porcelana',
  'Corona E.max',
  'Puente Fijo',
  'Carilla de Porcelana',
  'Incrustación Cerámica',
  'Prótesis Parcial Removible',
  'Prótesis Total',
  'Guarda Oclusal',
  'Placa de Michigan',
  'Provisional Acrílico',
  'Implante + Corona',
]

/* ── Helpers ──────────────────────────────────────────── */

function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + 'T23:59:59')
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/* ── WhatsApp icon ────────────────────────────────────── */

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════
   NEW ORDER MODAL
   ══════════════════════════════════════════════════════════ */

function NewOrderModal({
  onClose,
  onSave,
  patients,
  labs,
}: {
  onClose: () => void
  onSave: (order: Omit<LabOrder, 'id' | 'status' | 'fechaCreacion'>) => void
  patients: string[]
  labs: { nombre: string; whatsapp: string }[]
}) {
  const [paciente, setPaciente] = useState('')
  const [trabajo, setTrabajo] = useState(WORK_TYPES[0])
  const [pieza, setPieza] = useState('')
  const [lab, setLab] = useState(labs[0]?.nombre ?? '')
  const [colorCode, setColorCode] = useState('A2')
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [notas, setNotas] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatients, setShowPatients] = useState(false)

  const filtered = patients.filter((p) =>
    p.toLowerCase().includes(patientSearch.toLowerCase()),
  )

  const selectedLab = labs.find((l) => l.nombre === lab)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!paciente.trim() || !pieza.trim() || !fechaEntrega) return
    onSave({
      paciente: paciente.trim(),
      trabajo,
      pieza: pieza.trim(),
      laboratorio: lab,
      labWhatsApp: selectedLab?.whatsapp ?? '',
      colorCode,
      fechaEntrega,
      notas: notas.trim() || undefined,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-cyan-500/20 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none transition-colors focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 placeholder:text-clinical-white/25'

  const labelClass = 'mb-1 block text-xs font-medium text-clinical-white/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.form
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-cyan-500/20 bg-omega-surface shadow-2xl shadow-cyan-500/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15">
              <FlaskConical size={16} className="text-cyan-400" />
            </div>
            <h2 className="text-lg font-bold text-clinical-white">Nueva Orden de Lab</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-clinical-white/30 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white/60"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6">
          {/* Patient search */}
          <div className="relative">
            <label className={labelClass}>Paciente</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-white/25" />
              <input
                type="text"
                required
                value={paciente || patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value)
                  setPaciente('')
                  setShowPatients(true)
                }}
                onFocus={() => setShowPatients(true)}
                placeholder="Buscar paciente..."
                className={`${inputClass} pl-9`}
              />
            </div>
            {showPatients && patientSearch && (
              <div className="absolute z-20 mt-1 max-h-36 w-full overflow-y-auto rounded-lg border border-cyan-500/20 bg-omega-abyss shadow-lg">
                {filtered.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPaciente(p)
                      setPatientSearch('')
                      setShowPatients(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-clinical-white/70 transition-colors hover:bg-cyan-500/10 hover:text-clinical-white"
                  >
                    <User size={13} className="text-cyan-400/50" />
                    {p}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="px-3 py-2 text-xs text-clinical-white/30">Sin resultados</p>
                )}
              </div>
            )}
          </div>

          {/* Work type + Tooth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tipo de Trabajo</label>
              <select
                value={trabajo}
                onChange={(e) => setTrabajo(e.target.value)}
                className={inputClass}
              >
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Pieza Dental</label>
              <input
                type="text"
                required
                value={pieza}
                onChange={(e) => setPieza(e.target.value)}
                placeholder="Ej: #14, #21-#23"
                className={inputClass}
              />
            </div>
          </div>

          {/* Lab */}
          <div>
            <label className={labelClass}>Laboratorio</label>
            <select
              value={lab}
              onChange={(e) => setLab(e.target.value)}
              className={inputClass}
            >
              {labs.map((l) => (
                <option key={l.nombre} value={l.nombre}>{l.nombre}</option>
              ))}
            </select>
          </div>

          {/* Color + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Color (Guía VITA)</label>
              <div className="flex items-center gap-2">
                <select
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  className={`${inputClass} flex-1`}
                >
                  {SHADE_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div
                  className="h-9 w-9 shrink-0 rounded-lg border border-clinical-white/10"
                  style={{ backgroundColor: SHADE_GUIDE[colorCode] ?? '#ccc' }}
                  title={colorCode}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Fecha de Entrega</label>
              <input
                type="date"
                required
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notas (opcional)</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Alergias, observaciones del caso..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-cyan-500/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-clinical-white/10 px-4 py-2 text-sm font-medium text-clinical-white/50 transition-colors hover:bg-clinical-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-bold text-omega-abyss transition-colors hover:bg-cyan-400 active:scale-[0.97]"
          >
            <Plus size={16} />
            Crear Orden
          </button>
        </div>
      </motion.form>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   ORDER CARD
   ══════════════════════════════════════════════════════════ */

function OrderCard({
  order,
  colIdx,
  totalCols,
  onMove,
}: {
  order: LabOrder
  colIdx: number
  totalCols: number
  onMove: (id: number, direction: 'left' | 'right') => void
}) {
  const remaining = daysUntil(order.fechaEntrega)
  const isUrgent = remaining <= 1 && order.status !== 'entregado'
  const isOverdue = remaining < 0 && order.status !== 'entregado'

  function handleWhatsApp() {
    const msg = `Hola ${order.laboratorio}, ¿cómo va el caso de *${order.paciente}*?\n\nTrabajo: ${order.trabajo} ${order.pieza}\nColor: ${order.colorCode}\nFecha prometida: ${order.fechaEntrega}\n\nGracias.`
    window.open(`https://wa.me/${order.labWhatsApp}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`group rounded-xl border bg-omega-abyss/80 p-3.5 transition-colors ${
        isOverdue
          ? 'border-red-500/30 shadow-sm shadow-red-500/10'
          : isUrgent
            ? 'border-amber-500/30 shadow-sm shadow-amber-500/10'
            : 'border-clinical-white/[0.06] hover:border-cyan-500/20'
      }`}
    >
      {/* Patient row */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-xs font-bold text-cyan-300">
          {getInitials(order.paciente)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-clinical-white">{order.paciente}</p>
          <p className="truncate text-[11px] text-clinical-white/40">
            {order.trabajo} <span className="text-cyan-400">{order.pieza}</span>
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        {/* Lab */}
        <div className="flex items-center gap-1.5 text-[11px] text-clinical-white/40">
          <FlaskConical size={11} className="text-cyan-400/50" />
          <span className="truncate">{order.laboratorio}</span>
        </div>

        {/* Date + urgency */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-[11px] ${
            isOverdue
              ? 'font-semibold text-red-400'
              : isUrgent
                ? 'font-semibold text-amber-400'
                : 'text-clinical-white/40'
          }`}>
            {isOverdue ? (
              <AlertTriangle size={11} className="text-red-400" />
            ) : isUrgent ? (
              <AlertTriangle size={11} className="text-amber-400" />
            ) : (
              <Calendar size={11} />
            )}
            <span>
              {isOverdue
                ? `${Math.abs(remaining)}d atrasado`
                : remaining === 0
                  ? 'Hoy'
                  : `${remaining}d restantes`}
            </span>
          </div>

          {/* Color swatch */}
          <div className="flex items-center gap-1.5">
            <div
              className="h-5 w-5 rounded border border-clinical-white/10"
              style={{ backgroundColor: SHADE_GUIDE[order.colorCode] ?? '#ccc' }}
              title={`VITA ${order.colorCode}`}
            />
            <span className="text-[10px] font-semibold text-clinical-white/30">
              {order.colorCode}
            </span>
          </div>
        </div>

        {/* Notes badge */}
        {order.notas && (
          <p className="rounded-md bg-amber-500/10 px-2 py-1 text-[10px] leading-tight text-amber-300/70">
            {order.notas}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1.5 border-t border-clinical-white/5 pt-3">
        {/* Move left */}
        <button
          disabled={colIdx === 0}
          onClick={() => onMove(order.id, 'left')}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/30 transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:pointer-events-none disabled:opacity-20"
          title="Mover a columna anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Move right */}
        <button
          disabled={colIdx === totalCols - 1}
          onClick={() => onMove(order.id, 'right')}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-clinical-white/[0.06] text-clinical-white/30 transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-400 disabled:pointer-events-none disabled:opacity-20"
          title="Mover a columna siguiente"
        >
          <ChevronRight size={14} />
        </button>

        <div className="flex-1" />

        {/* WhatsApp */}
        {order.status !== 'entregado' && (
          <button
            onClick={handleWhatsApp}
            className="flex h-7 items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-[10px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
            title={`Chat con ${order.laboratorio}`}
          >
            <WaIcon size={12} />
            Lab
          </button>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export default function DentalLabTracker() {
  const { patients } = useData()
  const { labs } = useDentalLabs()
  const { orders, moveOrder, addOrder } = useLabOrders()
  const [modalOpen, setModalOpen] = useState(false)
  const [labDirOpen, setLabDirOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const patientNames = useMemo(() => patients.map((p) => p.nombre), [patients])
  const labsForSelect = useMemo(() => labs.map((l) => ({ nombre: l.nombre, whatsapp: l.whatsapp })), [labs])

  /* ── Board data ────────────────────────────────────── */

  const boardData = useMemo(() => {
    const lowerQ = searchQuery.toLowerCase()
    const filtered = searchQuery
      ? orders.filter(
          (o) =>
            o.paciente.toLowerCase().includes(lowerQ) ||
            o.trabajo.toLowerCase().includes(lowerQ) ||
            o.laboratorio.toLowerCase().includes(lowerQ),
        )
      : orders

    return COLUMNS.map((col) => ({
      ...col,
      orders: filtered.filter((o) => o.status === col.key),
    }))
  }, [orders, searchQuery])

  /* ── Stats ─────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total = orders.length
    const overdue = orders.filter(
      (o) => daysUntil(o.fechaEntrega) < 0 && o.status !== 'entregado',
    ).length
    const inProcess = orders.filter((o) => o.status === 'enviado').length
    const ready = orders.filter((o) => o.status === 'recibido').length
    return { total, overdue, inProcess, ready }
  }, [orders])

  /* ── Handlers ──────────────────────────────────────── */

  function handleMove(id: number, direction: 'left' | 'right') {
    const order = orders.find((o) => o.id === id)
    if (!order) return
    const idx = COLUMNS.findIndex((c) => c.key === order.status)
    const newIdx = direction === 'right' ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= COLUMNS.length) return
    const newStatus = COLUMNS[newIdx].key
    toast.success(`${order.paciente} → ${COLUMNS[newIdx].label}`, { duration: 2000 })
    moveOrder(id, newStatus)
  }

  async function handleNewOrder(data: Omit<LabOrder, 'id' | 'status' | 'fechaCreacion'>) {
    const patient = patients.find((p) => p.nombre === data.paciente)
    if (!patient) {
      toast.error('Paciente no encontrado')
      return
    }
    const lab = labs.find((l) => l.nombre === data.laboratorio)
    if (!lab) {
      toast.error('Laboratorio no encontrado')
      return
    }
    await addOrder({
      patient_id: patient.id,
      lab_id: lab.id,
      work_type: data.trabajo,
      tooth: data.pieza,
      shade_code: data.colorCode,
      due_date: data.fechaEntrega,
      notes: data.notas,
    })
    setModalOpen(false)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
            Lab Tracker
          </h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Seguimiento de trabajos con laboratorio dental
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-white/25" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-48 rounded-lg border border-cyan-500/20 bg-omega-abyss/50 py-2 pl-9 pr-3 text-xs text-clinical-white outline-none transition-colors focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 placeholder:text-clinical-white/25 dark:bg-omega-abyss/50"
            />
          </div>

          {/* Manage labs */}
          <button
            onClick={() => setLabDirOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/20 px-3 py-2 text-sm font-medium text-cyan-400 transition-colors hover:bg-cyan-500/10"
          >
            <Wrench size={16} />
            <span className="hidden sm:inline">Gestionar Labs</span>
          </button>

          {/* New order */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-omega-abyss shadow-md shadow-cyan-500/20 transition-all hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.97]"
          >
            <Plus size={18} />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
          { label: 'En proceso', value: stats.inProcess, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Listos', value: stats.ready, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          ...(stats.overdue > 0
            ? [{ label: 'Atrasados', value: stats.overdue, color: 'text-red-400 bg-red-500/10 border-red-500/20' }]
            : []),
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${color}`}
          >
            <span className="text-base font-bold tabular-nums">{value}</span>
            {label}
          </div>
        ))}
      </div>

      {/* ── Kanban Board ───────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-4 md:grid-cols-2">
        {boardData.map((col, colIdx) => (
          <div
            key={col.key}
            className="flex flex-col rounded-xl border border-clinical-white/[0.06] bg-omega-surface/50 dark:bg-omega-surface/50"
          >
            {/* Column header */}
            <div className={`rounded-t-xl bg-gradient-to-b ${col.gradient} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{col.emoji}</span>
                  <h3 className="text-sm font-bold text-clinical-white">{col.label}</h3>
                </div>
                <span
                  className={`flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[11px] font-bold ${col.badge}`}
                >
                  {col.orders.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2.5 p-3">
              <AnimatePresence mode="popLayout">
                {col.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    colIdx={colIdx}
                    totalCols={COLUMNS.length}
                    onMove={handleMove}
                  />
                ))}
              </AnimatePresence>

              {col.orders.length === 0 && (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-clinical-white/[0.06] py-10">
                  <p className="text-xs text-clinical-white/20">Sin órdenes</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── New Order Modal ──────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <NewOrderModal
            patients={patientNames}
            labs={labsForSelect}
            onClose={() => setModalOpen(false)}
            onSave={handleNewOrder}
          />
        )}
      </AnimatePresence>

      {/* ── Lab Directory Panel ────────────────────────── */}
      <AnimatePresence>
        {labDirOpen && <LabDirectory onClose={() => setLabDirOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
