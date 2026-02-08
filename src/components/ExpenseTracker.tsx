import { useState, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import {
  TrendingDown,
  DollarSign,
  FileText,
  Paperclip,
  Plus,
  Calendar,
  Tag,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Trash2,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useData, type CategoriaGasto } from '../context/DataContext'

/* ── Constants ─────────────────────────────────────────── */

const EXCHANGE_RATE = 7.75
type Currency = 'USD' | 'GTQ'

const CATEGORIAS: { key: CategoriaGasto; label: string; color: string }[] = [
  { key: 'alquiler', label: 'Alquiler', color: '#F43F5E' },
  { key: 'servicios', label: 'Servicios', color: '#F97316' },
  { key: 'nomina', label: 'Nómina', color: '#8B5CF6' },
  { key: 'insumos', label: 'Insumos Médicos', color: '#3B82F6' },
  { key: 'mantenimiento', label: 'Mantenimiento', color: '#14B8A6' },
  { key: 'marketing', label: 'Marketing', color: '#F59E0B' },
  { key: 'otro', label: 'Otro', color: '#6B7280' },
]

const CAT_MAP = Object.fromEntries(CATEGORIAS.map((c) => [c.key, c])) as Record<
  CategoriaGasto,
  (typeof CATEGORIAS)[number]
>

/* ── Helpers ───────────────────────────────────────────── */

function fmtMoney(n: number, cur: Currency) {
  if (cur === 'GTQ')
    return `Q ${(n * EXCHANGE_RATE).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getMonthRange() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    from: first.toISOString().split('T')[0],
    to: last.toISOString().split('T')[0],
    label: now.toLocaleDateString('es', { month: 'long', year: 'numeric' }),
  }
}

/* ── Component ─────────────────────────────────────────── */

export default function ExpenseTracker() {
  const { transactions, addTransaction, voidTransaction } = useData()
  const [cur, setCur] = useState<Currency>('USD')

  /* ── Form state ─────────────────────────────────────── */
  const today = new Date().toISOString().split('T')[0]
  const [concepto, setConcepto] = useState('')
  const [categoria, setCategoria] = useState<CategoriaGasto>('otro')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(today)
  const [comprobante, setComprobante] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── Filter state ───────────────────────────────────── */
  const [filterCat, setFilterCat] = useState<CategoriaGasto | 'todos'>('todos')

  /* ── Month data ─────────────────────────────────────── */
  const month = useMemo(() => getMonthRange(), [])

  const monthTx = useMemo(
    () => transactions.filter((t) => t.fecha >= month.from && t.fecha <= month.to && !t.anulado),
    [transactions, month],
  )

  const monthIncome = useMemo(
    () => monthTx.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0),
    [monthTx],
  )

  const monthExpenses = useMemo(
    () => monthTx.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0),
    [monthTx],
  )

  const netProfit = monthIncome - monthExpenses
  const isPositive = netProfit >= 0

  /* ── Expense breakdown for donut ────────────────────── */
  const donutData = useMemo(() => {
    const map: Record<string, number> = {}
    monthTx
      .filter((t) => t.tipo === 'gasto')
      .forEach((t) => {
        const cat = t.categoria ?? 'otro'
        map[cat] = (map[cat] || 0) + t.monto
      })
    return CATEGORIAS.filter((c) => (map[c.key] ?? 0) > 0).map((c) => ({
      name: c.label,
      value: map[c.key],
      color: c.color,
    }))
  }, [monthTx])

  /* ── Recent expenses list ───────────────────────────── */
  const recentExpenses = useMemo(() => {
    let list = transactions.filter((t) => t.tipo === 'gasto' && !t.anulado)
    if (filterCat !== 'todos') list = list.filter((t) => t.categoria === filterCat)
    return list.sort((a, b) => b.id - a.id).slice(0, 20)
  }, [transactions, filterCat])

  /* ── Submit ─────────────────────────────────────────── */

  async function handleSubmit() {
    if (!concepto.trim() || !monto || Number(monto) <= 0) {
      toast.error('Completa el concepto y monto')
      return
    }
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 500))

    const amount = cur === 'GTQ' ? Number(monto) / EXCHANGE_RATE : Number(monto)

    await addTransaction({
      fecha,
      concepto: concepto.trim(),
      monto: Math.round(amount * 100) / 100,
      tipo: 'gasto',
      categoria,
      comprobante: comprobante ?? undefined,
    })

    setConcepto('')
    setMonto('')
    setCategoria('otro')
    setFecha(today)
    setComprobante(null)
    setIsSaving(false)
  }

  /* ── File handler ───────────────────────────────────── */

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobante(file.name)
    toast.success(`Comprobante adjuntado: ${file.name}`)
  }

  /* ── Delete handler ─────────────────────────────────── */

  function handleDelete(id: number) {
    voidTransaction(id)
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ═══ FINANCIAL HEALTH CARD ════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900 p-6">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500" />

        <div className="mb-1 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-clinical-white">
              Salud Financiera del Mes
            </h2>
            <p className="text-xs capitalize text-gray-500">{month.label}</p>
          </div>
          {/* Currency toggle */}
          <div className="flex overflow-hidden rounded-lg border border-gray-700">
            {(['USD', 'GTQ'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCur(c)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  cur === c
                    ? 'bg-rose-400/15 text-rose-400'
                    : 'text-gray-500 hover:text-gray-300'
                } ${c === 'GTQ' ? 'border-l border-gray-700' : ''}`}
              >
                {c === 'USD' ? '$ USD' : 'Q GTQ'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {/* Income */}
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ArrowUpRight size={14} />
              Ingresos
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-400">
              {fmtMoney(monthIncome, cur)}
            </p>
          </div>

          {/* Expenses */}
          <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-4">
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <ArrowDownRight size={14} />
              Gastos
            </div>
            <p className="mt-1 text-xl font-bold text-rose-400">
              {fmtMoney(monthExpenses, cur)}
            </p>
          </div>

          {/* Net profit */}
          <div
            className={`rounded-xl border p-4 ${
              isPositive
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : 'border-rose-500/20 bg-rose-500/5'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              <DollarSign size={14} />
              Utilidad Neta
            </div>
            <p
              className={`mt-1 text-xl font-black ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {fmtMoney(netProfit, cur)}
            </p>
          </div>
        </div>
      </div>

      {/* ═══ MAIN GRID: Form + Chart ═════════════════ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── LEFT: Quick expense form ────────────────── */}
        <div className="space-y-4 rounded-2xl border border-gray-700/50 bg-gray-900 p-5 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-400/10">
              <TrendingDown size={18} className="text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-clinical-white">Registrar Gasto</h3>
              <p className="text-[10px] text-gray-500">Salida de caja</p>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Concepto *</label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Pago de Luz, Compra de Resina…"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500 focus:border-rose-400/40 focus:ring-2 focus:ring-rose-400/10"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Categoría</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaGasto)}
                className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-8 text-sm text-clinical-white outline-none transition-all focus:border-rose-400/40 focus:ring-2 focus:ring-rose-400/10"
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Monto ({cur}) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-rose-400">
                {cur === 'USD' ? '$' : 'Q'}
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-8 pr-3 text-right text-xl font-bold text-rose-400 outline-none transition-all placeholder:text-gray-600 focus:border-rose-400/40 focus:ring-2 focus:ring-rose-400/10"
              />
            </div>
            {monto && Number(monto) > 0 && (
              <p className="mt-1 text-right text-xs text-gray-500">
                {cur === 'USD'
                  ? `≈ Q ${(Number(monto) * EXCHANGE_RATE).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
                  : `≈ $ ${(Number(monto) / EXCHANGE_RATE).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Fecha</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all [color-scheme:dark] focus:border-rose-400/40 focus:ring-2 focus:ring-rose-400/10"
              />
            </div>
          </div>

          {/* Comprobante */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">Comprobante</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={`flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm transition-colors ${
                comprobante
                  ? 'border-rose-400/30 bg-rose-400/5 text-rose-400'
                  : 'border-gray-600 text-gray-500 hover:border-gray-500 hover:text-gray-400'
              }`}
            >
              <Paperclip size={16} />
              {comprobante ?? 'Adjuntar XML / PDF / Imagen'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".xml,.pdf,.jpg,.jpeg,.png"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-xl hover:shadow-rose-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            {isSaving ? 'Registrando…' : 'Registrar Gasto'}
          </button>
        </div>

        {/* ── RIGHT: Donut chart ──────────────────────── */}
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl border border-gray-700/50 bg-gray-900 p-5">
            <h3 className="mb-1 text-sm font-semibold text-clinical-white">
              ¿En qué se va el dinero?
            </h3>
            <p className="mb-4 text-xs capitalize text-gray-500">{month.label}</p>

            {donutData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-gray-600">
                No hay gastos registrados este mes
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {donutData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F9FAFB',
                      }}
                      formatter={(v: number) => [fmtMoney(v, cur), '']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-xs text-gray-400">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Category breakdown list */}
            {donutData.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {donutData
                  .sort((a, b) => b.value - a.value)
                  .map((d) => {
                    const pct = monthExpenses > 0 ? ((d.value / monthExpenses) * 100).toFixed(0) : '0'
                    return (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-gray-400">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{pct}%</span>
                          <span className="font-semibold text-clinical-white">
                            {fmtMoney(d.value, cur)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ RECENT EXPENSES TABLE ════════════════════ */}
      <div className="overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700/50 px-5 py-3">
          <h3 className="text-sm font-semibold text-clinical-white">Egresos Recientes</h3>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as CategoriaGasto | 'todos')}
              className="rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-clinical-white outline-none"
            >
              <option value="todos">Todas las categorías</option>
              {CATEGORIAS.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-96 divide-y divide-gray-800 overflow-y-auto">
          {recentExpenses.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-gray-600">
              No hay gastos registrados
            </div>
          )}

          {recentExpenses.map((t) => {
            const catInfo = t.categoria ? CAT_MAP[t.categoria] : CAT_MAP.otro
            return (
              <div
                key={t.id}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: catInfo.color + '15', color: catInfo.color }}
                  >
                    <TrendingDown size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-clinical-white">{t.concepto}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>{t.fecha}</span>
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                        style={{ backgroundColor: catInfo.color + '15', color: catInfo.color }}
                      >
                        {catInfo.label}
                      </span>
                      {t.comprobante && (
                        <span className="flex items-center gap-0.5 text-gray-500">
                          <Paperclip size={9} />
                          {t.comprobante}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-rose-400">
                    -{fmtMoney(t.monto, cur)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                    title="Eliminar gasto"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
