import { useState, useMemo } from 'react'
import { Search, Plus, FileText, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import type { Invoice, InvoiceStatus } from '../../types/database'
import { formatMoney, type Currency } from '../../utils/currency'

interface InvoiceListProps {
  invoices: Invoice[]
  currency: Currency
  onSelect: (invoice: Invoice) => void
  onCreateNew: () => void
}

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; cls: string }> = {
  borrador: { label: 'Borrador', cls: 'bg-gray-500/15 text-gray-400' },
  emitida: { label: 'Emitida', cls: 'bg-blue-500/15 text-blue-400' },
  pagada: { label: 'Pagada', cls: 'bg-emerald-500/15 text-emerald-400' },
  anulada: { label: 'Anulada', cls: 'bg-red-500/15 text-red-400' },
}

const TABS: { key: InvoiceStatus | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'borrador', label: 'Borrador' },
  { key: 'emitida', label: 'Emitidas' },
  { key: 'pagada', label: 'Pagadas' },
  { key: 'anulada', label: 'Anuladas' },
]

export default function InvoiceList({ invoices, currency, onSelect, onCreateNew }: InvoiceListProps) {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<InvoiceStatus | 'todas'>('todas')

  const filtered = useMemo(() => {
    let list = invoices
    if (tab !== 'todas') list = list.filter(i => i.estado === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.pacienteNombre.toLowerCase().includes(q) ||
        i.numero.toLowerCase().includes(q) ||
        i.nit.toLowerCase().includes(q),
      )
    }
    return list
  }, [invoices, tab, search])

  const stats = useMemo(() => {
    const total = invoices.length
    const pendientes = invoices.filter(i => i.estado === 'emitida').length
    const pagadas = invoices.filter(i => i.estado === 'pagada').length
    const totalFacturado = invoices
      .filter(i => i.estado !== 'anulada')
      .reduce((s, i) => s + i.total, 0)
    return { total, pendientes, pagadas, totalFacturado }
  }, [invoices])

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-clinical-white/10 bg-omega-surface/50 p-4">
          <div className="flex items-center gap-2 text-clinical-white/50">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Total Facturas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-clinical-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-clinical-white/10 bg-omega-surface/50 p-4">
          <div className="flex items-center gap-2 text-blue-400/70">
            <Clock className="h-4 w-4" />
            <span className="text-xs font-medium">Pendientes</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-400">{stats.pendientes}</p>
        </div>
        <div className="rounded-xl border border-clinical-white/10 bg-omega-surface/50 p-4">
          <div className="flex items-center gap-2 text-emerald-400/70">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium">Pagadas</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-400">{stats.pagadas}</p>
        </div>
        <div className="rounded-xl border border-clinical-white/10 bg-omega-surface/50 p-4">
          <div className="flex items-center gap-2 text-beta-mint/70">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs font-medium">Total Facturado</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-beta-mint">
            {formatMoney(stats.totalFacturado, currency)}
          </p>
        </div>
      </div>

      {/* Tabs + search + new button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-omega-surface/50 p-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-omega-violet text-white'
                  : 'text-clinical-white/60 hover:text-clinical-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-clinical-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por paciente, # o NIT..."
              className="w-full rounded-lg border border-clinical-white/10 bg-omega-abyss py-2 pl-10 pr-3 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30"
            />
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-lg bg-omega-violet px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-omega-violet/80"
          >
            <Plus className="h-4 w-4" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-clinical-white/10 py-16">
          <FileText className="mb-3 h-10 w-10 text-clinical-white/20" />
          <p className="text-sm text-clinical-white/40">No hay facturas</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-clinical-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-clinical-white/10 bg-omega-surface/30">
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50">#</th>
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50">Fecha</th>
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50">Paciente</th>
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50">NIT</th>
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50 text-right">Total</th>
                <th className="px-4 py-3 text-xs font-semibold text-clinical-white/50">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const st = STATUS_CONFIG[inv.estado]
                return (
                  <tr
                    key={inv.id}
                    onClick={() => onSelect(inv)}
                    className="cursor-pointer border-b border-clinical-white/5 transition-colors hover:bg-clinical-white/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-beta-mint">{inv.numero}</td>
                    <td className="px-4 py-3 text-clinical-white/70">{inv.fecha}</td>
                    <td className="px-4 py-3 font-medium text-clinical-white">{inv.pacienteNombre}</td>
                    <td className="px-4 py-3 font-mono text-xs text-clinical-white/50">{inv.nit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-clinical-white">
                      {formatMoney(inv.total, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
