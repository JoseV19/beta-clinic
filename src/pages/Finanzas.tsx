import { useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  X,
  LayoutGrid,
  Terminal,
  Receipt,
} from 'lucide-react'
import { useData, type Transaction } from '../context/DataContext'
import FinancialTerminal from '../components/FinancialTerminal'
import ExpenseTracker from '../components/ExpenseTracker'

/* ── Types ─────────────────────────────────────────────── */

type Tab = 'todos' | 'ingresos' | 'gastos'

/* ── Helpers ───────────────────────────────────────────── */

const fmtUSD = (n: number) =>
  `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* ── Modal ─────────────────────────────────────────────── */

function NewTxModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (tx: Omit<Transaction, 'id'>) => void
}) {
  const today = new Date().toISOString().split('T')[0]
  const [tipo, setTipo] = useState<Transaction['tipo']>('ingreso')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(today)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!concepto.trim() || !monto) return
    onSave({ fecha, concepto: concepto.trim(), monto: Number(monto), tipo })
  }

  const inputClass =
    'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-omega-dark dark:text-clinical-white">
            Registrar Movimiento
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tipo toggle */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo('ingreso')}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  tipo === 'ingreso'
                    ? 'bg-emerald-500 text-white dark:bg-beta-mint dark:text-omega-dark'
                    : 'border border-omega-violet/20 text-omega-dark/60 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
                }`}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setTipo('gasto')}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                  tipo === 'gasto'
                    ? 'bg-alert-red text-white'
                    : 'border border-omega-violet/20 text-omega-dark/60 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
                }`}
              >
                Gasto
              </button>
            </div>
          </div>

          {/* Concepto */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Concepto</label>
            <input
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Ej. Consulta General, Compra insumos…"
              className={inputClass}
            />
          </div>

          {/* Monto */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Monto (USD)</label>
            <input
              type="number"
              required
              min={1}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-omega-violet/20 px-4 py-2 text-sm font-medium text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2 text-sm font-bold text-omega-dark transition-colors hover:bg-beta-mint/80"
          >
            <Plus size={16} />
            Registrar
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

type View = 'resumen' | 'terminal' | 'gastos'

export default function Finanzas() {
  const { transactions, addTransaction } = useData()
  const [tab, setTab] = useState<Tab>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [view, setView] = useState<View>('resumen')

  const totals = useMemo(() => {
    const ingresos = transactions.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
    const gastos = transactions.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
    return { ingresos, gastos, balance: ingresos - gastos }
  }, [transactions])

  const filtered = useMemo(() => {
    if (tab === 'ingresos') return transactions.filter((t) => t.tipo === 'ingreso')
    if (tab === 'gastos') return transactions.filter((t) => t.tipo === 'gasto')
    return transactions
  }, [transactions, tab])

  function handleSave(tx: Omit<Transaction, 'id'>) {
    addTransaction(tx)
    setModalOpen(false)
  }

  const summaryCards: { label: string; value: number; icon: typeof Scale; color: string }[] = [
    { label: 'Balance Total', value: totals.balance, icon: Scale, color: totals.balance >= 0 ? 'text-beta-mint' : 'text-alert-red' },
    { label: 'Ingresos', value: totals.ingresos, icon: TrendingUp, color: 'text-emerald-500 dark:text-beta-mint' },
    { label: 'Gastos', value: totals.gastos, icon: TrendingDown, color: 'text-alert-red' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Finanzas</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Gestión de ingresos y gastos
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex gap-1 rounded-lg border border-omega-violet/20 p-0.5 dark:border-clinical-white/10">
            <button
              onClick={() => setView('resumen')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'resumen'
                  ? 'bg-omega-violet/10 text-omega-dark dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/40 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              <LayoutGrid size={14} /> Resumen
            </button>
            <button
              onClick={() => setView('terminal')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'terminal'
                  ? 'bg-omega-violet/10 text-omega-dark dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/40 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              <Terminal size={14} /> POS
            </button>
            <button
              onClick={() => setView('gastos')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === 'gastos'
                  ? 'bg-omega-violet/10 text-omega-dark dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/40 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              <Receipt size={14} /> Gastos
            </button>
          </div>

          {view === 'resumen' && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
            >
              <Plus size={18} />
              Registrar Movimiento
            </button>
          )}
        </div>
      </div>

      {/* POS Terminal View */}
      {view === 'terminal' && <FinancialTerminal />}

      {/* Expense Tracker View */}
      {view === 'gastos' && <ExpenseTracker />}

      {/* Summary View */}
      {view === 'resumen' && (<>
      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-omega-violet via-beta-mint to-omega-violet" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                  {label}
                </p>
                <p className={`mt-2 text-2xl font-bold ${color}`}>
                  {fmtUSD(value)}
                </p>
              </div>
              <div className="rounded-lg bg-omega-violet/10 p-2.5 dark:bg-omega-violet/25">
                <Icon size={20} className={color} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Table */}
      <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-omega-violet/10 px-4 pt-3 dark:border-clinical-white/5">
          {([
            ['todos', 'Todos'],
            ['ingresos', 'Ingresos'],
            ['gastos', 'Gastos'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-b-2 border-beta-mint bg-beta-mint/10 text-omega-dark dark:text-clinical-white'
                  : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Fecha</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Concepto</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Tipo</th>
                <th className="px-5 py-3 text-right font-medium text-omega-dark/70 dark:text-clinical-white/50">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                >
                  <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{t.fecha}</td>
                  <td className="px-5 py-3 font-medium text-omega-dark dark:text-clinical-white">{t.concepto}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.tipo === 'ingreso'
                          ? 'bg-beta-mint/15 text-emerald-700 dark:text-beta-mint'
                          : 'bg-alert-red/10 text-alert-red'
                      }`}
                    >
                      {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      t.tipo === 'ingreso'
                        ? 'text-emerald-600 dark:text-beta-mint'
                        : 'text-alert-red'
                    }`}
                  >
                    {t.tipo === 'ingreso' ? '+' : '-'}{fmtUSD(t.monto)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-omega-dark/40 dark:text-clinical-white/30">
                    No hay transacciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </>)}

      {/* Modal */}
      {modalOpen && <NewTxModal onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  )
}
