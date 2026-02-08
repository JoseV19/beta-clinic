import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import {
  DollarSign,
  CreditCard,
  Landmark,
  ShieldCheck,
  Banknote,
  Receipt,
  Search,
  TrendingUp,
  XCircle,
  Lock,
  Printer,
  Clock,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useData, type MetodoPago } from '../context/DataContext'

/* ── Constants ─────────────────────────────────────────── */

const TODAY = new Date().toISOString().split('T')[0]
const DAILY_GOAL_USD = 650 // $650 USD daily goal
const EXCHANGE_RATE = 7.75 // 1 USD ≈ 7.75 GTQ

type Currency = 'USD' | 'GTQ'

const CONCEPTOS = [
  'Consulta General',
  'Consulta Especialista',
  'Limpieza Dental',
  'Ortodoncia — Control',
  'Ecografía',
  'Laboratorio',
  'Procedimiento Menor',
  'Control Pediatría',
  'Evaluación Nutricional',
  'Telemedicina',
]

const METODOS: {
  key: MetodoPago
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  emoji: string
}[] = [
  { key: 'efectivo', label: 'Efectivo', icon: Banknote, emoji: '\uD83D\uDCB5' },
  { key: 'tarjeta', label: 'Tarjeta', icon: CreditCard, emoji: '\uD83D\uDCB3' },
  { key: 'transferencia', label: 'Transferencia', icon: Landmark, emoji: '\uD83C\uDFE6' },
  { key: 'seguro', label: 'Seguro', icon: ShieldCheck, emoji: '\uD83D\uDEE1\uFE0F' },
]

/* ── Helpers ───────────────────────────────────────────── */

function fmtMoney(n: number, cur: Currency) {
  if (cur === 'GTQ') {
    return `Q ${(n * EXCHANGE_RATE).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function getWeekData(
  transactions: { fecha: string; monto: number; tipo: string; anulado?: boolean }[],
) {
  const days: { label: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().split('T')[0]
    const dayLabel = d.toLocaleDateString('es', { weekday: 'short' })
    const total = transactions
      .filter((t) => t.fecha === iso && t.tipo === 'ingreso' && !t.anulado)
      .reduce((s, t) => s + t.monto, 0)
    days.push({ label: dayLabel, total })
  }
  return days
}

/* ── Component ─────────────────────────────────────────── */

export default function FinancialTerminal() {
  const { patients, transactions, addTransaction, voidTransaction } = useData()

  /* ── Currency state ─────────────────────────────────── */
  const [cur, setCur] = useState<Currency>('USD')

  /* ── Form state ─────────────────────────────────────── */
  const [patientQuery, setPatientQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [isCharging, setIsCharging] = useState(false)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)

  /* ── Void state ─────────────────────────────────────── */
  const [voidingId, setVoidingId] = useState<number | null>(null)
  const [adminPin, setAdminPin] = useState('')

  /* ── Z-Report state ─────────────────────────────────── */
  const [showZReport, setShowZReport] = useState(false)

  /* ── Patient search ─────────────────────────────────── */
  const filteredPatients = useMemo(
    () =>
      patientQuery.length > 0
        ? patients
            .filter(
              (p) =>
                p.nombre.toLowerCase().includes(patientQuery.toLowerCase()) ||
                p.documento.includes(patientQuery),
            )
            .slice(0, 5)
        : [],
    [patients, patientQuery],
  )

  /* ── Today's data ───────────────────────────────────── */
  const todayTx = useMemo(
    () =>
      transactions
        .filter((t) => t.fecha === TODAY && t.tipo === 'ingreso')
        .sort((a, b) => b.id - a.id),
    [transactions],
  )

  const todayActive = todayTx.filter((t) => !t.anulado)

  const todayTotal = useMemo(
    () => todayActive.reduce((s, t) => s + t.monto, 0),
    [todayActive],
  )

  const metodBreakdown = useMemo(() => {
    const map: Record<MetodoPago, number> = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      seguro: 0,
    }
    todayActive.forEach((t) => {
      if (t.metodo) map[t.metodo] += t.monto
    })
    return map
  }, [todayActive])

  const weekData = useMemo(() => getWeekData(transactions), [transactions])

  const goalReached = todayTotal >= DAILY_GOAL_USD

  /* ── Charge handler ─────────────────────────────────── */

  async function handleCharge() {
    if (!concepto.trim() || !monto || Number(monto) <= 0) {
      toast.error('Completa el concepto y monto')
      return
    }
    setIsCharging(true)
    await new Promise((r) => setTimeout(r, 600))

    const label = selectedPatient
      ? `${concepto} — ${selectedPatient}`
      : concepto

    await addTransaction({
      fecha: TODAY,
      concepto: label,
      monto: Number(monto),
      tipo: 'ingreso',
      metodo,
      paciente: selectedPatient || undefined,
    })

    // Check if we just hit goal
    const newTotal = todayTotal + Number(monto)
    if (!goalReached && newTotal >= DAILY_GOAL_USD) {
      setTimeout(() => {
        toast('Meta diaria alcanzada', {
          icon: '\u2728',
          description: `Superaste la meta de ${fmtMoney(DAILY_GOAL_USD, cur)}`,
        })
      }, 400)
    }

    // Reset
    setPatientQuery('')
    setSelectedPatient('')
    setConcepto('')
    setMonto('')
    setMetodo('efectivo')
    setIsCharging(false)
  }

  /* ── Void handler ───────────────────────────────────── */

  async function handleVoid(id: number) {
    if (adminPin !== '1234') {
      toast.error('PIN incorrecto')
      return
    }
    await voidTransaction(id)
    setVoidingId(null)
    setAdminPin('')
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ═══ LEFT PANEL — CHARGE FORM ═════════════════ */}
      <div className="space-y-5 lg:col-span-2">
        {/* Title card + currency toggle */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10">
                <DollarSign size={20} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-clinical-white">
                  Registrar Cobro
                </h2>
                <p className="text-xs text-gray-500">Punto de Venta — POS</p>
              </div>
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
                      ? 'bg-yellow-400/15 text-yellow-400'
                      : 'text-gray-500 hover:text-gray-300'
                  } ${c === 'GTQ' ? 'border-l border-gray-700' : ''}`}
                >
                  {c === 'USD' ? '$ USD' : 'Q GTQ'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 rounded-2xl border border-gray-700/50 bg-gray-900 p-5">
          {/* Patient search */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Paciente
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={selectedPatient || patientQuery}
                onChange={(e) => {
                  setPatientQuery(e.target.value)
                  setSelectedPatient('')
                  setShowPatientDropdown(true)
                }}
                onFocus={() => setShowPatientDropdown(true)}
                placeholder="Buscar paciente…"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-clinical-white outline-none transition-all placeholder:text-gray-500 focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/10"
              />
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPatient(p.nombre)
                        setPatientQuery('')
                        setShowPatientDropdown(false)
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-700"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400/10 text-[10px] font-bold text-yellow-400">
                        {p.nombre
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <div>
                        <p className="font-medium text-clinical-white">
                          {p.nombre}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {p.documento}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Concepto *
            </label>
            <div className="relative">
              <select
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 pr-8 text-sm text-clinical-white outline-none transition-all focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/10"
              >
                <option value="">Seleccionar concepto…</option>
                {CONCEPTOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
            </div>
          </div>

          {/* Monto */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Monto ({cur}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-yellow-400">
                {cur === 'USD' ? '$' : 'Q'}
              </span>
              <input
                type="number"
                min={0}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 py-3 pl-8 pr-3 text-right text-2xl font-bold text-emerald-400 outline-none transition-all placeholder:text-gray-600 focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/10"
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

          {/* Payment method */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Método de Pago
            </label>
            <div className="grid grid-cols-2 gap-2">
              {METODOS.map(({ key, label, icon: Icon, emoji }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMetodo(key)}
                  className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all ${
                    metodo === key
                      ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400 shadow-inner'
                      : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>
                    {emoji} {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Charge button */}
          <button
            type="button"
            onClick={handleCharge}
            disabled={isCharging}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50"
          >
            {isCharging ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Receipt size={18} />
            )}
            {isCharging ? 'Procesando…' : 'Cobrar e Imprimir Recibo'}
          </button>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — SUMMARY ════════════════════ */}
      <div className="space-y-5 lg:col-span-3">
        {/* ── Z-Report / Corte de Caja ─────────────── */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
            goalReached
              ? 'border-yellow-400/30 bg-gradient-to-br from-gray-900 via-gray-900 to-yellow-400/5'
              : 'border-gray-700/50 bg-gray-900'
          }`}
        >
          {goalReached && (
            <div className="absolute right-4 top-4">
              <Sparkles size={20} className="animate-pulse text-yellow-400" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total Cobrado Hoy
              </p>
              <p
                className={`mt-1 text-3xl font-black ${
                  goalReached ? 'text-yellow-400' : 'text-emerald-400'
                }`}
              >
                {fmtMoney(todayTotal, cur)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                Meta: {fmtMoney(DAILY_GOAL_USD, cur)}
                {goalReached && (
                  <span className="ml-1.5 text-yellow-400">Alcanzada</span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowZReport(!showZReport)}
              className="flex items-center gap-2 rounded-lg border border-yellow-400/20 px-3 py-2 text-xs font-semibold text-yellow-400 transition-colors hover:bg-yellow-400/10"
            >
              <Printer size={14} />
              Corte de Caja
            </button>
          </div>

          {/* Breakdown */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {METODOS.map(({ key, label, emoji }) => (
              <div
                key={key}
                className="rounded-lg border border-gray-700/50 bg-gray-800/50 px-3 py-2"
              >
                <p className="text-[10px] text-gray-500">
                  {emoji} {label}
                </p>
                <p className="text-sm font-bold text-clinical-white">
                  {fmtMoney(metodBreakdown[key], cur)}
                </p>
              </div>
            ))}
          </div>

          {/* Z-Report expanded */}
          {showZReport && (
            <div className="mt-4 rounded-xl border border-yellow-400/10 bg-gray-800/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-yellow-400">
                  Reporte Z — Cierre de Turno
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {new Date().toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Transacciones</span>
                  <span className="font-semibold text-clinical-white">
                    {todayActive.length}
                  </span>
                </div>
                {METODOS.map(({ key, label }) => {
                  const count = todayActive.filter(
                    (t) => t.metodo === key,
                  ).length
                  return (
                    <div
                      key={key}
                      className="flex justify-between border-b border-gray-700/50 pb-2"
                    >
                      <span className="text-gray-400">{label}</span>
                      <span className="text-clinical-white">
                        {count}x — {fmtMoney(metodBreakdown[key], cur)}
                      </span>
                    </div>
                  )
                })}
                <div className="flex justify-between border-b border-gray-700/50 pb-2">
                  <span className="text-gray-400">Anulados</span>
                  <span className="text-red-400">
                    {todayTx.filter((t) => t.anulado).length}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-semibold text-yellow-400">
                    TOTAL NETO
                  </span>
                  <span className="text-lg font-black text-yellow-400">
                    {fmtMoney(todayTotal, cur)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.success('Turno cerrado', {
                    description: `Total: ${fmtMoney(todayTotal, cur)}`,
                  })
                  setShowZReport(false)
                }}
                className="mt-4 w-full rounded-lg bg-yellow-400/15 py-2.5 text-xs font-bold text-yellow-400 transition-colors hover:bg-yellow-400/25"
              >
                Cerrar Turno
              </button>
            </div>
          )}
        </div>

        {/* ── Weekly chart ─────────────────────────────── */}
        <div className="rounded-2xl border border-gray-700/50 bg-gray-900 p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-clinical-white">
            <TrendingUp size={16} className="text-emerald-400" />
            Ingresos de la Semana
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="#10B981"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor="#10B981"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F9FAFB',
                  }}
                  formatter={((v: number) => fmtMoney(v, cur)) as never}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Today's movements ────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-700/50 px-5 py-3">
            <h3 className="text-sm font-semibold text-clinical-white">
              Movimientos de Hoy
            </h3>
            <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
              {todayTx.length}
            </span>
          </div>

          <div className="max-h-80 divide-y divide-gray-800 overflow-y-auto">
            {todayTx.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-gray-600">
                No hay cobros registrados hoy
              </div>
            )}

            {todayTx.map((t) => {
              const metodInfo = METODOS.find((m) => m.key === t.metodo)
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between px-5 py-3 transition-colors ${
                    t.anulado ? 'opacity-40' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                        t.anulado
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {t.anulado ? (
                        <XCircle size={16} />
                      ) : metodInfo ? (
                        <metodInfo.icon size={16} />
                      ) : (
                        <DollarSign size={16} />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          t.anulado
                            ? 'text-gray-500 line-through'
                            : 'text-clinical-white'
                        }`}
                      >
                        {t.concepto}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {metodInfo?.emoji} {metodInfo?.label ?? '—'}
                        {t.anulado && (
                          <span className="ml-1.5 text-red-400">ANULADO</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        t.anulado ? 'text-gray-500' : 'text-emerald-400'
                      }`}
                    >
                      {fmtMoney(t.monto, cur)}
                    </span>
                    {!t.anulado && (
                      <button
                        type="button"
                        onClick={() => setVoidingId(t.id)}
                        className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Anular cobro"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ═══ VOID CONFIRMATION MODAL ══════════════════ */}
      {voidingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setVoidingId(null)
              setAdminPin('')
            }}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-red-500/20 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                <Lock size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-clinical-white">
                  Anular Cobro
                </h3>
                <p className="text-xs text-gray-500">
                  Ingresa PIN de administrador
                </p>
              </div>
            </div>

            <input
              type="password"
              maxLength={4}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
              placeholder="PIN (1234)"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-3 text-center text-2xl tracking-[0.5em] text-clinical-white outline-none transition-all placeholder:text-sm placeholder:tracking-normal focus:border-red-400/40 focus:ring-2 focus:ring-red-400/10"
              autoFocus
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setVoidingId(null)
                  setAdminPin('')
                }}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleVoid(voidingId)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/15 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/25"
              >
                <XCircle size={16} />
                Anular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
