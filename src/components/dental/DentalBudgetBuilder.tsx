import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Trash2,
  Printer,
  Send,
  Save,
  ChevronDown,
  Receipt,
  FileText,
  ArrowRight,
  FilePlus2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import { useData } from '../../context/DataContext'
import { usePersistentState } from '../../hooks/usePersistentState'
import ConfirmDialog from '../ui/ConfirmDialog'

/* ── Types ─────────────────────────────────────────────── */

interface Treatment {
  name: string
  price: number
}

interface LineItem {
  id: number
  treatment: string
  tooth: string
  unitPrice: number
  qty: number
  discount: number
}

type BudgetStatus = 'borrador' | 'aceptado' | 'rechazado'

export interface SavedBudget {
  id: number
  patientName: string
  patientId: number
  items: LineItem[]
  status: BudgetStatus
  total: number
  currency: Currency
  createdAt: string
}

interface PendingBudget {
  patientId: number
  patientName: string
  items: { treatment: string; tooth: string; unitPrice: number }[]
}

/* ── Sample data ───────────────────────────────────────── */

const SAMPLE_TREATMENTS: Treatment[] = [
  { name: 'Limpieza Ultrasónica', price: 50 },
  { name: 'Resina Fotocurada', price: 40 },
  { name: 'Extracción Simple', price: 30 },
  { name: 'Endodoncia Unirradicular', price: 120 },
  { name: 'Corona de Porcelana', price: 250 },
  { name: 'Blanqueamiento Láser', price: 180 },
  { name: 'Radiografía Periapical', price: 15 },
  { name: 'Sellante de Fosas', price: 25 },
]

const STATUS_CONFIG: Record<BudgetStatus, { label: string; bg: string; text: string }> = {
  borrador:  { label: 'Borrador',  bg: 'bg-white/10',              text: 'text-white/60' },
  aceptado:  { label: 'Aceptado',  bg: 'bg-emerald-500/15',        text: 'text-emerald-400' },
  rechazado: { label: 'Rechazado', bg: 'bg-red-500/15',            text: 'text-red-400' },
}

/* ── Currency ──────────────────────────────────────────── */

type Currency = 'USD' | 'GTQ'
const EXCHANGE_RATE = 7.75 // 1 USD ≈ 7.75 GTQ

function formatMoney(n: number, cur: Currency) {
  if (cur === 'GTQ') {
    return `Q${(n * EXCHANGE_RATE).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/* ── Helpers ───────────────────────────────────────────── */

let nextId = 1

function lineTotal(item: LineItem) {
  const gross = item.unitPrice * item.qty
  return gross - gross * (item.discount / 100)
}

/* ── Component ─────────────────────────────────────────── */

export default function DentalBudgetBuilder() {
  const navigate = useNavigate()
  const { patients, addInvoice } = useData()
  const [savedBudgets, setSavedBudgets] = usePersistentState<SavedBudget[]>('beta_dental_budgets', [])

  /* ── Editing state ──────────────────────────────────── */
  const [editingId, setEditingId] = useState<number | null>(null)
  const [items, setItems] = useState<LineItem[]>([])
  const [status, setStatus] = useState<BudgetStatus>('borrador')
  const [patientId, setPatientId] = useState(0)
  const [patientName, setPatientName] = useState('')
  const [cur, setCur] = useState<Currency>('USD')
  const [confirmClear, setConfirmClear] = useState(false)

  /* Selector state */
  const [selectedTreatment, setSelectedTreatment] = useState('')
  const [selectedTooth, setSelectedTooth] = useState('')

  /* Calculations */
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.unitPrice * i.qty, 0), [items])
  const totalDiscount = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.qty * (i.discount / 100), 0),
    [items],
  )
  const total = subtotal - totalDiscount

  /* ── Load pending budget from Odontograma on mount ─── */

  useEffect(() => {
    const raw = localStorage.getItem('beta_pending_budget')
    if (!raw) return
    try {
      const pending: PendingBudget = JSON.parse(raw)
      setPatientId(pending.patientId)
      setPatientName(pending.patientName)
      setItems(pending.items.map((item) => ({
        id: nextId++,
        treatment: item.treatment,
        tooth: item.tooth,
        unitPrice: item.unitPrice,
        qty: 1,
        discount: 0,
      })))
      localStorage.removeItem('beta_pending_budget')
      toast.success('Items importados del odontograma')
    } catch { /* ignore malformed */ }
  }, [])

  /* ── Sync patient name when patient selector changes ── */

  function handlePatientChange(id: number) {
    setPatientId(id)
    if (id === 0) {
      setPatientName('')
    } else {
      const p = patients.find(pat => pat.id === id)
      setPatientName(p?.nombre ?? '')
    }
  }

  /* ── Actions ─────────────────────────────────────────── */

  function addItem() {
    if (!selectedTreatment) {
      toast.error('Selecciona un tratamiento')
      return
    }
    const treatment = SAMPLE_TREATMENTS.find(t => t.name === selectedTreatment)
    if (!treatment) return

    setItems(prev => [
      ...prev,
      {
        id: nextId++,
        treatment: treatment.name,
        tooth: selectedTooth || '—',
        unitPrice: treatment.price,
        qty: 1,
        discount: 0,
      },
    ])
    setSelectedTreatment('')
    setSelectedTooth('')
    toast.success(`${treatment.name} agregado`)
  }

  function removeItem(id: number) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id: number, field: keyof LineItem, value: string | number) {
    setItems(prev =>
      prev.map(i => (i.id === id ? { ...i, [field]: value } : i)),
    )
  }

  function handleSave() {
    if (!items.length) {
      toast.error('Agrega al menos un tratamiento')
      return
    }
    const budget: SavedBudget = {
      id: editingId ?? Date.now(),
      patientName: patientName || 'Sin paciente',
      patientId,
      items,
      status,
      total,
      currency: cur,
      createdAt: editingId
        ? (savedBudgets.find(b => b.id === editingId)?.createdAt ?? new Date().toISOString())
        : new Date().toISOString(),
    }

    if (editingId) {
      setSavedBudgets(prev => prev.map(b => b.id === editingId ? budget : b))
    } else {
      setSavedBudgets(prev => [budget, ...prev])
    }

    setEditingId(budget.id)
    toast.success(editingId ? 'Presupuesto actualizado' : 'Presupuesto guardado')
  }

  function loadBudget(budget: SavedBudget) {
    setEditingId(budget.id)
    setItems(budget.items.map(item => ({ ...item })))
    setStatus(budget.status)
    setPatientId(budget.patientId)
    setPatientName(budget.patientName)
    setCur(budget.currency)
    nextId = Math.max(...budget.items.map(i => i.id), 0) + 1
  }

  function handleNewBudget() {
    setEditingId(null)
    setItems([])
    setStatus('borrador')
    setPatientId(0)
    setPatientName('')
    setSelectedTreatment('')
    setSelectedTooth('')
  }

  function deleteBudget(id: number) {
    setSavedBudgets(prev => prev.filter(b => b.id !== id))
    if (editingId === id) handleNewBudget()
    toast.success('Presupuesto eliminado')
  }

  function handleGenerateInvoice() {
    if (!items.length) {
      toast.error('Agrega al menos un tratamiento')
      return
    }
    const now = new Date()
    addInvoice({
      numero: `FAC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`,
      fecha: now.toISOString().split('T')[0],
      pacienteId: patientId,
      pacienteNombre: patientName || 'Sin paciente',
      nit: 'CF',
      items: items.map((item, i) => ({
        id: i + 1,
        descripcion: `${item.treatment} (${item.tooth})`,
        cantidad: item.qty,
        precioUnitario: item.unitPrice,
        total: lineTotal(item),
      })),
      subtotal,
      iva: 0,
      total,
      currency: cur,
      estado: 'borrador',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    // Also save/update the budget as 'aceptado'
    if (editingId) {
      setStatus('aceptado')
      setSavedBudgets(prev => prev.map(b => b.id === editingId ? { ...b, status: 'aceptado' as BudgetStatus } : b))
    }
    toast.success('Factura generada correctamente')
    navigate('/facturacion')
  }

  function handlePrintPDF() {
    if (!items.length) {
      toast.error('Agrega al menos un tratamiento')
      return
    }
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Beta Clinic', w / 2, 20, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Presupuesto Dental', w / 2, 27, { align: 'center' })

    // Patient info
    doc.setFontSize(11)
    doc.text(`Paciente: ${patientName || 'Sin paciente'}`, 14, 40)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-GT')}`, 14, 47)
    doc.text(`Estado: ${STATUS_CONFIG[status].label}`, 14, 54)

    // Table header
    let y = 65
    doc.setFillColor(124, 58, 237) // omega-violet
    doc.rect(14, y, w - 28, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Tratamiento', 16, y + 5.5)
    doc.text('Diente', 90, y + 5.5)
    doc.text('P.Unit.', 115, y + 5.5)
    doc.text('Cant.', 140, y + 5.5)
    doc.text('Desc.', 158, y + 5.5)
    doc.text('Total', w - 16, y + 5.5, { align: 'right' })

    // Table rows
    y += 8
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    for (const item of items) {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.setFillColor(y % 16 < 8 ? 248 : 240, y % 16 < 8 ? 249 : 241, y % 16 < 8 ? 250 : 242)
      doc.rect(14, y, w - 28, 7, 'F')
      doc.setFontSize(9)
      doc.text(item.treatment, 16, y + 5)
      doc.text(item.tooth, 90, y + 5)
      doc.text(formatMoney(item.unitPrice, cur), 115, y + 5)
      doc.text(String(item.qty), 143, y + 5)
      doc.text(item.discount > 0 ? `${item.discount}%` : '—', 161, y + 5)
      doc.text(formatMoney(lineTotal(item), cur), w - 16, y + 5, { align: 'right' })
      y += 7
    }

    // Totals
    y += 5
    doc.setDrawColor(200, 200, 200)
    doc.line(14, y, w - 14, y)
    y += 7
    doc.setFontSize(10)
    doc.text('Subtotal:', 120, y)
    doc.text(formatMoney(subtotal, cur), w - 16, y, { align: 'right' })
    if (totalDiscount > 0) {
      y += 6
      doc.text('Descuento:', 120, y)
      doc.setTextColor(220, 38, 38)
      doc.text(`-${formatMoney(totalDiscount, cur)}`, w - 16, y, { align: 'right' })
      doc.setTextColor(0, 0, 0)
    }
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('TOTAL:', 120, y)
    doc.text(formatMoney(total, cur), w - 16, y, { align: 'right' })

    // Footer
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Presupuesto generado por Beta Clinic', w / 2, 285, { align: 'center' })

    doc.save(`presupuesto_${(patientName || 'sin_paciente').replace(/\s+/g, '_').toLowerCase()}.pdf`)
    toast.success('PDF generado')
  }

  function handleWhatsApp() {
    if (!items.length) {
      toast.error('Agrega al menos un tratamiento')
      return
    }
    const lines = items.map(
      i => `• ${i.treatment} (${i.tooth}) x${i.qty} — ${formatMoney(lineTotal(i), cur)}`,
    )
    const msg = [
      `*Presupuesto Dental — Beta Clinic*`,
      patientName ? `Paciente: ${patientName}` : '',
      '',
      ...lines,
      '',
      `Subtotal: ${formatMoney(subtotal, cur)}`,
      totalDiscount > 0 ? `Descuento: -${formatMoney(totalDiscount, cur)}` : '',
      `*TOTAL: ${formatMoney(total, cur)}*`,
    ]
      .filter(Boolean)
      .join('\n')

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  /* ── Render helpers ────────────────────────────────────── */

  const inputCls = 'w-full rounded-lg border border-omega-violet/20 bg-white px-4 py-2.5 text-sm text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-cyan-500/40 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-cyan-500/40'

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ════════ Saved Budgets List ════════ */}
      {savedBudgets.length > 0 && (
        <div className="rounded-xl border border-omega-violet/20 dark:border-clinical-white/10">
          <div className="flex items-center justify-between border-b border-omega-violet/10 px-4 py-3 dark:border-clinical-white/[0.06]">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-omega-dark dark:text-clinical-white">
                Presupuestos Guardados
              </h3>
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                {savedBudgets.length}
              </span>
            </div>
            <button
              onClick={handleNewBudget}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
            >
              <FilePlus2 size={13} />
              Nuevo
            </button>
          </div>
          <div className="max-h-48 divide-y divide-omega-violet/5 overflow-y-auto dark:divide-clinical-white/[0.04]">
            {savedBudgets.map(b => {
              const cfg = STATUS_CONFIG[b.status]
              return (
                <div
                  key={b.id}
                  onClick={() => loadBudget(b)}
                  className={`group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-cyan-500/[0.04] ${editingId === b.id ? 'bg-cyan-500/[0.06]' : ''}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-omega-dark dark:text-clinical-white">
                      {b.patientName}
                    </p>
                    <p className="text-[10px] text-omega-dark/40 dark:text-clinical-white/30">
                      {b.items.length} tratamientos · {new Date(b.createdAt).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-bold text-omega-dark dark:text-cyan-300">
                    {formatMoney(b.total, b.currency)}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteBudget(b.id) }}
                    className="rounded-lg p-1.5 text-omega-dark/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 dark:text-clinical-white/15"
                    aria-label="Eliminar presupuesto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ════════ Builder ════════ */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ════════ LEFT: Builder ════════ */}
        <div className="min-w-0 flex-1 space-y-5">
          {/* ── Header + Status ──────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-omega-dark dark:text-clinical-white">
                {editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <p className="mt-0.5 text-xs text-omega-dark/40 dark:text-clinical-white/30">
                Agrega tratamientos y genera la cotización
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Currency toggle */}
              <div className="flex overflow-hidden rounded-lg border border-omega-violet/20 dark:border-clinical-white/10">
                {(['USD', 'GTQ'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCur(c)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      cur === c
                        ? 'bg-cyan-500/15 text-cyan-400'
                        : 'text-omega-dark/30 hover:text-omega-dark/60 dark:text-clinical-white/20 dark:hover:text-clinical-white/40'
                    } ${c === 'GTQ' ? 'border-l border-omega-violet/20 dark:border-clinical-white/10' : ''}`}
                  >
                    {c === 'USD' ? '$ USD' : 'Q GTQ'}
                  </button>
                ))}
              </div>

              {(['borrador', 'aceptado', 'rechazado'] as const).map(s => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      status === s
                        ? `${cfg.bg} ${cfg.text}`
                        : 'text-white/20 hover:text-white/40 dark:text-clinical-white/20'
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Patient selector ─────────────────────────── */}
          <div className="relative">
            <select
              value={patientId}
              onChange={e => handlePatientChange(Number(e.target.value))}
              className={inputCls + ' appearance-none pr-8'}
            >
              <option value={0}>Seleccionar paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-omega-dark/30 dark:text-clinical-white/30"
            />
          </div>

          {/* ── Add treatment row ────────────────────────── */}
          <div className="flex flex-wrap items-end gap-2">
            {/* Treatment select */}
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                Tratamiento
              </label>
              <div className="relative">
                <select
                  value={selectedTreatment}
                  onChange={e => setSelectedTreatment(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-omega-violet/20 bg-white py-2.5 pl-3 pr-8 text-sm text-omega-dark outline-none focus:border-cyan-500/40 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:focus:border-cyan-500/40"
                >
                  <option value="">Seleccionar...</option>
                  {SAMPLE_TREATMENTS.map(t => (
                    <option key={t.name} value={t.name}>
                      {t.name} — {formatMoney(t.price, cur)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-omega-dark/30 dark:text-clinical-white/30"
                />
              </div>
            </div>

            {/* Tooth */}
            <div className="w-24">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                Diente
              </label>
              <input
                value={selectedTooth}
                onChange={e => setSelectedTooth(e.target.value)}
                placeholder="#18"
                className="w-full rounded-lg border border-omega-violet/20 bg-white px-3 py-2.5 text-sm text-omega-dark outline-none placeholder:text-omega-dark/30 focus:border-cyan-500/40 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-cyan-500/40"
              />
            </div>

            {/* Add button */}
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-omega-abyss transition-transform hover:scale-105 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.5} />
              Agregar
            </button>
          </div>

          {/* ── Items table ──────────────────────────────── */}
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-omega-violet/15 py-16 text-center dark:border-clinical-white/[0.06]">
              <Receipt size={40} className="mx-auto text-omega-dark/15 dark:text-clinical-white/10" />
              <p className="mt-3 text-sm text-omega-dark/30 dark:text-clinical-white/20">
                Agrega tratamientos para construir el presupuesto
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-omega-violet/20 dark:border-clinical-white/10">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/[0.06] dark:bg-cyan-500/[0.04]">
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      Tratamiento
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      Diente
                    </th>
                    <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      P. Unit.
                    </th>
                    <th className="w-16 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      Cant.
                    </th>
                    <th className="w-20 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      Desc. %
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-cyan-400/60">
                      Total
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr
                      key={item.id}
                      className="border-b border-omega-violet/5 transition-colors hover:bg-omega-violet/[0.02] dark:border-clinical-white/[0.04] dark:hover:bg-cyan-500/[0.03]"
                    >
                      {/* Treatment */}
                      <td className="px-4 py-3 font-medium text-omega-dark dark:text-clinical-white">
                        {item.treatment}
                      </td>

                      {/* Tooth */}
                      <td className="px-3 py-3 text-center text-omega-dark/60 dark:text-clinical-white/50">
                        {item.tooth}
                      </td>

                      {/* Unit price (editable) */}
                      <td className="px-3 py-3 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e =>
                            updateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))
                          }
                          className="w-20 rounded border border-transparent bg-transparent text-right text-sm text-omega-dark outline-none focus:border-cyan-500/30 focus:bg-white dark:text-clinical-white dark:focus:bg-omega-surface"
                        />
                      </td>

                      {/* Qty */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={e =>
                            updateItem(item.id, 'qty', Math.max(1, Number(e.target.value)))
                          }
                          className="w-12 rounded border border-transparent bg-transparent text-center text-sm text-omega-dark outline-none focus:border-cyan-500/30 focus:bg-white dark:text-clinical-white dark:focus:bg-omega-surface"
                        />
                      </td>

                      {/* Discount */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discount}
                          onChange={e =>
                            updateItem(
                              item.id,
                              'discount',
                              Math.min(100, Math.max(0, Number(e.target.value))),
                            )
                          }
                          className="w-14 rounded border border-transparent bg-transparent text-center text-sm text-omega-dark outline-none focus:border-cyan-500/30 focus:bg-white dark:text-clinical-white dark:focus:bg-omega-surface"
                        />
                      </td>

                      {/* Line total */}
                      <td className="px-4 py-3 text-right font-semibold text-omega-dark dark:text-cyan-300">
                        {formatMoney(lineTotal(item), cur)}
                      </td>

                      {/* Delete */}
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-1.5 text-omega-dark/30 transition-colors hover:bg-red-500/10 hover:text-red-500 dark:text-clinical-white/20 dark:hover:text-red-400"
                          aria-label="Eliminar tratamiento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Action buttons ───────────────────────────── */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-omega-abyss transition-transform hover:scale-105 active:scale-95"
              >
                <Save size={16} />
                {editingId ? 'Actualizar' : 'Guardar'} Presupuesto
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-2 rounded-lg border border-omega-violet/20 px-4 py-2.5 text-sm font-semibold text-omega-dark transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white dark:hover:bg-clinical-white/5"
              >
                <Printer size={16} />
                Imprimir PDF
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 rounded-lg border border-[#25D366]/30 px-4 py-2.5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
              >
                <Send size={16} />
                Enviar WhatsApp
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="flex items-center gap-2 rounded-lg bg-omega-violet px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
              >
                <FileText size={16} />
                Generar Factura
                <ArrowRight size={14} />
              </button>
              {items.length > 0 && (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="ml-auto flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-400/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 size={14} />
                  Limpiar
                </button>
              )}
            </div>
          )}
        </div>

        {/* ════════ RIGHT: Ticket / Summary ════════ */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="sticky top-6 rounded-2xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/[0.08] dark:bg-omega-surface">
            {/* Ticket header */}
            <div className="mb-4 border-b border-dashed border-omega-violet/10 pb-4 text-center dark:border-clinical-white/[0.06]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-omega-dark/40 dark:text-clinical-white/30">
                Resumen
              </p>
              <p className="mt-1 text-lg font-bold text-omega-dark dark:text-clinical-white">
                {patientName || 'Paciente'}
              </p>
              <div className="mt-1.5 flex justify-center">
                {(() => {
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}
                    >
                      {cfg.label}
                    </span>
                  )
                })()}
              </div>
            </div>

            {/* Line items */}
            {items.length === 0 ? (
              <p className="py-6 text-center text-xs text-omega-dark/25 dark:text-clinical-white/15">
                Sin tratamientos
              </p>
            ) : (
              <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-omega-dark dark:text-clinical-white/80">
                        {item.treatment}
                      </p>
                      <p className="text-[10px] text-omega-dark/40 dark:text-clinical-white/30">
                        {item.tooth} · x{item.qty}
                        {item.discount > 0 && ` · -${item.discount}%`}
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold text-omega-dark dark:text-clinical-white/70">
                      {formatMoney(lineTotal(item), cur)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2 border-t border-dashed border-omega-violet/10 pt-4 dark:border-clinical-white/[0.06]">
              <div className="flex justify-between text-xs">
                <span className="text-omega-dark/50 dark:text-clinical-white/35">Subtotal</span>
                <span className="text-omega-dark dark:text-clinical-white/60">
                  {formatMoney(subtotal, cur)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-omega-dark/50 dark:text-clinical-white/35">Descuento</span>
                  <span className="text-red-400">-{formatMoney(totalDiscount, cur)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-omega-violet/10 pt-3 dark:border-clinical-white/[0.06]">
                <span className="text-xs font-bold uppercase tracking-wider text-omega-dark/60 dark:text-clinical-white/40">
                  Total
                </span>
                <span className="text-2xl font-black text-omega-dark dark:text-cyan-400">
                  {formatMoney(total, cur)}
                </span>
              </div>
            </div>

            {/* Item count */}
            <p className="mt-4 text-center text-[10px] text-omega-dark/30 dark:text-clinical-white/20">
              {items.length} {items.length === 1 ? 'tratamiento' : 'tratamientos'} · {new Date().toLocaleDateString('es-GT')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Confirm clear dialog ─── */}
      <ConfirmDialog
        open={confirmClear}
        title="Limpiar presupuesto"
        message="¿Deseas eliminar todos los tratamientos del presupuesto actual?"
        confirmLabel="Limpiar"
        variant="danger"
        onConfirm={() => { setItems([]); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
