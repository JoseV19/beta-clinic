import { useState, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FlaskConical,
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '../context/DataContext'
import { usePersistentState } from '../hooks/usePersistentState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

/* ── Types ─────────────────────────────────────────────── */

interface LabFile {
  name: string
  size: number
  date: string
}

interface LabOrder {
  id: number
  patientId: number
  patientName: string
  examName: string
  doctor: string
  fecha: string
  estado: 'pendiente' | 'en_proceso' | 'completado'
  resultados?: string
  archivos: LabFile[]
  createdAt: string
}

type LabStatus = LabOrder['estado']

const STATUS_CONFIG: Record<LabStatus, { label: string; cls: string }> = {
  pendiente: { label: 'Pendiente', cls: 'bg-amber-500/15 text-amber-400' },
  en_proceso: { label: 'En Proceso', cls: 'bg-blue-500/15 text-blue-400' },
  completado: { label: 'Completado', cls: 'bg-emerald-500/15 text-emerald-400' },
}

/* ── Component ─────────────────────────────────────────── */

export default function Laboratorios() {
  const { patients } = useData()
  const [orders, setOrders] = usePersistentState<LabOrder[]>('beta_lab_orders', [])

  const [showNew, setShowNew] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LabOrder | null>(null)
  const [search, setSearch] = useState('')

  /* New order form */
  const [newPatientId, setNewPatientId] = useState(0)
  const [newExam, setNewExam] = useState('')
  const [newDoctor, setNewDoctor] = useState('')

  const filtered = orders.filter(o =>
    o.patientName.toLowerCase().includes(search.toLowerCase()) ||
    o.examName.toLowerCase().includes(search.toLowerCase()),
  )

  /* ── CRUD ────────────────────────────────────────────── */

  function handleCreateOrder() {
    const pat = patients.find(p => p.id === newPatientId)
    if (!pat) { toast.error('Selecciona un paciente'); return }
    if (!newExam.trim()) { toast.error('Ingresa el nombre del examen'); return }

    const id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1
    const order: LabOrder = {
      id,
      patientId: pat.id,
      patientName: pat.nombre,
      examName: newExam.trim(),
      doctor: newDoctor.trim() || 'Sin especificar',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      archivos: [],
      createdAt: new Date().toISOString(),
    }
    setOrders(prev => [order, ...prev])
    toast.success('Orden creada')
    setShowNew(false)
    setNewPatientId(0)
    setNewExam('')
    setNewDoctor('')
  }

  function updateStatus(id: number, estado: LabStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, estado } : o))
    toast.success(`Estado actualizado: ${STATUS_CONFIG[estado].label}`)
  }

  function updateResultados(id: number, resultados: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, resultados } : o))
  }

  function handleDelete() {
    if (!deleteTarget) return
    setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success('Orden eliminada')
  }

  /* ── File handling ───────────────────────────────────── */

  function handleFiles(orderId: number, fileList: FileList | File[]) {
    const newFiles: LabFile[] = Array.from(fileList).map(f => ({
      name: f.name,
      size: f.size,
      date: new Date().toISOString().split('T')[0],
    }))
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, archivos: [...o.archivos, ...newFiles] } : o,
    ))
    toast.success(`${newFiles.length} archivo(s) adjuntado(s)`)
  }

  function removeFile(orderId: number, fileName: string) {
    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, archivos: o.archivos.filter(f => f.name !== fileName) } : o,
    ))
  }

  const inputCls = 'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-clinical-white">Laboratorios</h1>
          <p className="mt-0.5 text-sm text-clinical-white/40">
            {orders.length} órdenes registradas
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 active:scale-[0.97]"
        >
          <Plus size={18} />
          Nueva Orden
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-clinical-white/25" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por paciente o examen..."
          className="w-full rounded-xl border border-clinical-white/10 bg-omega-surface py-2.5 pl-10 pr-4 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10"
        />
      </div>

      {/* New order modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNew(false)} />
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-clinical-white/10 bg-omega-surface p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-clinical-white">Nueva Orden de Laboratorio</h2>
                <button onClick={() => setShowNew(false)} className="rounded-lg p-1.5 text-clinical-white/40 hover:bg-clinical-white/5" aria-label="Cerrar">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-clinical-white/50">Paciente *</label>
                  <select value={newPatientId} onChange={e => setNewPatientId(Number(e.target.value))} className={inputCls}>
                    <option value={0}>Seleccionar paciente...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-clinical-white/50">Examen *</label>
                  <input value={newExam} onChange={e => setNewExam(e.target.value)} placeholder="Hemograma completo" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-clinical-white/50">Doctor</label>
                  <input value={newDoctor} onChange={e => setNewDoctor(e.target.value)} placeholder="Dr. Rodríguez" className={inputCls} />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setShowNew(false)} className="rounded-lg border border-clinical-white/10 px-4 py-2 text-xs font-medium text-clinical-white/60 hover:bg-clinical-white/5">
                  Cancelar
                </button>
                <button onClick={handleCreateOrder} className="rounded-lg bg-omega-violet px-5 py-2 text-xs font-semibold text-white hover:bg-omega-violet/80">
                  Crear Orden
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(order => {
            const isExpanded = expandedId === order.id
            const sCfg = STATUS_CONFIG[order.estado]
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-xl border border-clinical-white/10 bg-omega-surface transition-shadow hover:shadow-md"
              >
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left"
                >
                  <FlaskConical size={18} className="shrink-0 text-beta-mint" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-clinical-white">{order.examName}</p>
                    <p className="text-xs text-clinical-white/40">{order.patientName} · {order.fecha} · {order.doctor}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sCfg.cls}`}>
                    {sCfg.label}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-clinical-white/30" /> : <ChevronDown size={16} className="text-clinical-white/30" />}
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-clinical-white/5 px-5 py-4 space-y-4">
                        {/* Status changer */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-clinical-white/50">Estado</label>
                          <div className="flex gap-1.5">
                            {(Object.keys(STATUS_CONFIG) as LabStatus[]).map(s => (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                  order.estado === s
                                    ? STATUS_CONFIG[s].cls + ' ring-1 ring-current'
                                    : 'text-clinical-white/40 hover:text-clinical-white/60'
                                }`}
                              >
                                {STATUS_CONFIG[s].label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Results */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-clinical-white/50">Resultados / Notas</label>
                          <textarea
                            value={order.resultados || ''}
                            onChange={e => updateResultados(order.id, e.target.value)}
                            rows={3}
                            placeholder="Escribir resultados del examen..."
                            className={`${inputCls} resize-none`}
                          />
                        </div>

                        {/* File upload */}
                        <div>
                          <label className="mb-1 block text-xs font-medium text-clinical-white/50">Archivos</label>
                          <DropZone orderId={order.id} onFiles={handleFiles} />
                          {order.archivos.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              {order.archivos.map(f => (
                                <div key={f.name} className="flex items-center gap-2 rounded-lg border border-clinical-white/5 bg-omega-abyss px-3 py-2">
                                  <FileText size={14} className="shrink-0 text-beta-mint" />
                                  <span className="min-w-0 flex-1 truncate text-xs text-clinical-white">{f.name}</span>
                                  <span className="text-[10px] text-clinical-white/30">{(f.size / 1024).toFixed(0)} KB</span>
                                  <button onClick={() => {}} className="p-0.5 text-clinical-white/20 hover:text-beta-mint" aria-label="Descargar">
                                    <Download size={12} />
                                  </button>
                                  <button onClick={() => removeFile(order.id, f.name)} className="p-0.5 text-clinical-white/20 hover:text-red-400" aria-label="Eliminar archivo">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delete */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-400/60 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                            Eliminar orden
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-clinical-white/10 py-16 text-center">
          <FlaskConical size={40} className="mx-auto text-clinical-white/15" />
          <p className="mt-3 text-sm font-medium text-clinical-white/40">
            {search ? 'No se encontraron órdenes' : 'No hay órdenes de laboratorio'}
          </p>
          {!search && (
            <button
              onClick={() => setShowNew(true)}
              className="mt-3 text-xs font-semibold text-beta-mint hover:text-beta-mint/80"
            >
              + Crear la primera orden
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Orden"
        message={`¿Eliminar la orden "${deleteTarget?.examName}" de ${deleteTarget?.patientName}?`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

/* ── Drop zone sub-component ────────────────────────────── */

function DropZone({ orderId, onFiles }: { orderId: number; onFiles: (id: number, files: FileList | File[]) => void }) {
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) onFiles(orderId, e.dataTransfer.files)
  }

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) onFiles(orderId, e.target.files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`flex items-center justify-center rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors ${
        dragOver
          ? 'border-beta-mint bg-beta-mint/5'
          : 'border-clinical-white/10 hover:border-clinical-white/20'
      }`}
    >
      <Upload size={16} className={`mr-2 ${dragOver ? 'text-beta-mint' : 'text-clinical-white/20'}`} />
      <p className="text-xs text-clinical-white/40">
        Arrastra archivos o{' '}
        <label className="cursor-pointer font-semibold text-beta-mint underline">
          selecciona
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleSelect} className="hidden" />
        </label>
      </p>
    </div>
  )
}
