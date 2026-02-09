import { useState } from 'react'
import { Plus, Trash2, Save, X, FileDown, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Invoice, InvoiceItem, InvoiceStatus, PaymentMethod } from '../../types/database'
import { formatMoney, type Currency, EXCHANGE_RATE, IVA_RATE } from '../../utils/currency'
import { useData } from '../../context/DataContext'
import { openWhatsApp } from '../../services/whatsapp'
import { generateInvoicePDF } from './InvoicePDF'
import { useSettings } from '../../context/SettingsContext'

interface InvoiceBuilderProps {
  invoice?: Invoice
  onSave: (invoice: Omit<Invoice, 'id'>) => void
  onCancel: () => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'transferencia', label: 'Transferencia' },
]

const STATUS_OPTIONS: { value: InvoiceStatus; label: string; cls: string }[] = [
  { value: 'borrador', label: 'Borrador', cls: 'bg-gray-500/15 text-gray-400' },
  { value: 'emitida', label: 'Emitida', cls: 'bg-blue-500/15 text-blue-400' },
  { value: 'pagada', label: 'Pagada', cls: 'bg-emerald-500/15 text-emerald-400' },
  { value: 'anulada', label: 'Anulada', cls: 'bg-red-500/15 text-red-400' },
]

export default function InvoiceBuilder({ invoice, onSave, onCancel }: InvoiceBuilderProps) {
  const { patients } = useData()
  const { clinic } = useSettings()

  const [currency, setCurrency] = useState<Currency>(invoice?.currency ?? 'USD')
  const [pacienteId, setPacienteId] = useState(invoice?.pacienteId ?? 0)
  const [pacienteNombre, setPacienteNombre] = useState(invoice?.pacienteNombre ?? '')
  const [nit, setNit] = useState(invoice?.nit ?? 'CF')
  const [estado, setEstado] = useState<InvoiceStatus>(invoice?.estado ?? 'borrador')
  const [metodoPago, setMetodoPago] = useState<PaymentMethod | ''>(invoice?.metodoPago ?? '')
  const [notas, setNotas] = useState(invoice?.notas ?? '')
  const [items, setItems] = useState<InvoiceItem[]>(
    invoice?.items ?? [{ id: 1, descripcion: '', cantidad: 1, precioUnitario: 0, total: 0 }],
  )

  let nextItemId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1

  const subtotal = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0)
  const iva = subtotal * IVA_RATE
  const total = subtotal + iva

  function addItem() {
    setItems(prev => [...prev, { id: nextItemId++, descripcion: '', cantidad: 1, precioUnitario: 0, total: 0 }])
  }

  function removeItem(id: number) {
    if (items.length <= 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function updateItem(id: number, field: keyof InvoiceItem, value: string | number) {
    setItems(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const updated = { ...i, [field]: value }
        updated.total = updated.precioUnitario * updated.cantidad
        return updated
      }),
    )
  }

  function selectPatient(id: number) {
    const p = patients.find(p => p.id === id)
    if (!p) return
    setPacienteId(id)
    setPacienteNombre(p.nombre || `Paciente #${id}`)
  }

  function handleSave() {
    if (!pacienteNombre.trim()) {
      toast.error('Selecciona un paciente')
      return
    }
    if (!nit.trim()) {
      toast.error('El NIT es obligatorio')
      return
    }
    if (items.some(i => !i.descripcion.trim())) {
      toast.error('Completa la descripción de todos los ítems')
      return
    }
    if (items.some(i => i.precioUnitario <= 0)) {
      toast.error('El precio unitario debe ser mayor a 0')
      return
    }

    const now = new Date().toISOString()
    onSave({
      numero: invoice?.numero ?? '',
      fecha: invoice?.fecha ?? new Date().toISOString().slice(0, 10),
      pacienteId,
      pacienteNombre: pacienteNombre.trim(),
      nit: nit.trim(),
      items: items.map(i => ({ ...i, total: i.precioUnitario * i.cantidad })),
      subtotal,
      iva,
      total,
      currency,
      estado,
      metodoPago: metodoPago || undefined,
      notas: notas.trim() || undefined,
      createdAt: invoice?.createdAt ?? now,
      updatedAt: now,
    })
  }

  function handlePDF() {
    if (!pacienteNombre.trim()) {
      toast.error('Selecciona un paciente primero')
      return
    }
    const inv: Invoice = {
      id: invoice?.id ?? 0,
      numero: invoice?.numero ?? 'BORRADOR',
      fecha: invoice?.fecha ?? new Date().toISOString().slice(0, 10),
      pacienteId,
      pacienteNombre,
      nit,
      items: items.map(i => ({ ...i, total: i.precioUnitario * i.cantidad })),
      subtotal,
      iva,
      total,
      currency,
      estado,
      metodoPago: metodoPago || undefined,
      notas: notas.trim() || undefined,
      createdAt: invoice?.createdAt ?? '',
      updatedAt: '',
    }
    const doc = generateInvoicePDF(inv, {
      nombre: clinic.nombre,
      direccion: clinic.direccion,
      telefono: clinic.telefono,
      nit: clinic.nit,
    })
    doc.save(`Factura-${inv.numero}.pdf`)
    toast.success('PDF generado')
  }

  function handleWhatsApp() {
    if (!pacienteNombre.trim()) return
    const patient = patients.find(p => p.id === pacienteId)
    const phone = patient?.telefono ?? ''
    if (!phone) {
      toast.error('El paciente no tiene teléfono registrado')
      return
    }
    const msg = `Hola ${pacienteNombre}, su factura ${invoice?.numero ?? ''} por ${formatMoney(total, currency)} ha sido generada.\n\nGracias por su confianza.\n— ${clinic.nombre || 'Beta Clinic'}`
    openWhatsApp(phone, msg)
  }

  const inputCls = 'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-clinical-white">
          {invoice ? `Editar ${invoice.numero}` : 'Nueva Factura'}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePDF} className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-white/10 px-3 py-2 text-xs font-medium text-clinical-white/70 transition-colors hover:bg-clinical-white/5">
            <FileDown className="h-3.5 w-3.5" /> PDF
          </button>
          <button onClick={handleWhatsApp} className="inline-flex items-center gap-1.5 rounded-lg border border-clinical-white/10 px-3 py-2 text-xs font-medium text-clinical-white/70 transition-colors hover:bg-clinical-white/5">
            <Send className="h-3.5 w-3.5" /> WhatsApp
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <div className="space-y-5 lg:col-span-2">
          {/* Patient + NIT */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Paciente</label>
              <select
                value={pacienteId}
                onChange={e => selectPatient(Number(e.target.value))}
                className={inputCls}
              >
                <option value={0}>Seleccionar paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre || `Paciente #${p.id}`}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">NIT</label>
              <input value={nit} onChange={e => setNit(e.target.value)} placeholder="CF o NIT" className={inputCls} />
            </div>
          </div>

          {/* Status + Payment + Currency */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Estado</label>
              <div className="flex gap-1">
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setEstado(s.value)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${
                      estado === s.value ? s.cls + ' ring-1 ring-current' : 'text-clinical-white/40 hover:text-clinical-white/60'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Método de Pago</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value as PaymentMethod)} className={inputCls}>
                <option value="">Sin especificar</option>
                {PAYMENT_METHODS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-clinical-white/50">Moneda</label>
              <div className="flex overflow-hidden rounded-lg border border-clinical-white/10">
                {(['USD', 'GTQ'] as Currency[]).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-2 text-xs font-bold transition-colors ${
                      currency === c ? 'bg-omega-violet text-white' : 'bg-omega-abyss text-clinical-white/50 hover:text-clinical-white'
                    }`}
                  >
                    {c === 'USD' ? '$ USD' : 'Q GTQ'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-clinical-white/50">Ítems</label>
              <button onClick={addItem} className="inline-flex items-center gap-1 text-xs font-medium text-beta-mint transition-colors hover:text-beta-mint/80">
                <Plus className="h-3.5 w-3.5" /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_120px_40px] gap-2 items-center">
                  <input
                    value={item.descripcion}
                    onChange={e => updateItem(item.id, 'descripcion', e.target.value)}
                    placeholder="Descripción del servicio"
                    className={inputCls}
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={e => updateItem(item.id, 'cantidad', Number(e.target.value))}
                    className={`${inputCls} text-center`}
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.precioUnitario || ''}
                    onChange={e => updateItem(item.id, 'precioUnitario', Number(e.target.value))}
                    placeholder="Precio"
                    className={inputCls}
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="flex items-center justify-center rounded-lg p-2 text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-xs font-medium text-clinical-white/50">Notas</label>
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              rows={2}
              placeholder="Notas opcionales..."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* Right: Summary ticket */}
        <div className="lg:sticky lg:top-6">
          <div className="rounded-2xl border border-clinical-white/10 bg-omega-surface/50 p-5">
            <h3 className="mb-4 text-sm font-bold text-clinical-white/70">Resumen</h3>

            <div className="space-y-2 border-b border-clinical-white/10 pb-4">
              {items.filter(i => i.descripcion).map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="truncate text-clinical-white/60">{item.descripcion} x{item.cantidad}</span>
                  <span className="ml-2 shrink-0 text-clinical-white">{formatMoney(item.precioUnitario * item.cantidad, currency)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-clinical-white/50">
                <span>Subtotal</span>
                <span>{formatMoney(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-clinical-white/50">
                <span>IVA (12%)</span>
                <span>{formatMoney(iva, currency)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-clinical-white/10 pt-3">
                <span className="text-sm font-bold text-clinical-white">Total</span>
                <span className="text-lg font-black text-beta-mint">{formatMoney(total, currency)}</span>
              </div>
              {currency === 'USD' && (
                <p className="text-right text-[10px] text-clinical-white/30">
                  ≈ Q{(total * EXCHANGE_RATE).toLocaleString('es-GT', { minimumFractionDigits: 2 })} GTQ
                </p>
              )}
            </div>

            {/* FEL notice */}
            <div className="mt-4 rounded-lg border border-dashed border-clinical-white/10 px-3 py-2">
              <p className="text-[10px] font-medium text-clinical-white/30">
                FEL (Facturación Electrónica) pendiente de integración con SAT Guatemala
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-omega-violet px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-omega-violet/80"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 rounded-xl border border-clinical-white/10 px-4 py-3 text-sm font-medium text-clinical-white/60 transition-colors hover:bg-clinical-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
