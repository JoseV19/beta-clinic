import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Package,
  Plus,
  Minus,
  X,
  Search,
  AlertTriangle,
  PackageOpen,
} from 'lucide-react'
import { usePersistentState } from '../hooks/usePersistentState'

/* ── Types ─────────────────────────────────────────────── */

interface Product {
  id: number
  nombre: string
  sku: string
  categoria: 'Medicamento' | 'Insumo' | 'Equipo'
  stock: number
  fechaVencimiento: string
  precioUnitario: number
}

/* ── Helpers ───────────────────────────────────────────── */

const fmtCOP = (n: number) =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })

function daysUntil(dateStr: string) {
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}

/* ── Default data ─────────────────────────────────────── */

const defaultProducts: Product[] = [
  { id: 1, nombre: 'Losartán 50 mg', sku: 'MED-001', categoria: 'Medicamento', stock: 120, fechaVencimiento: '2026-08-15', precioUnitario: 1500 },
  { id: 2, nombre: 'Ibuprofeno 400 mg', sku: 'MED-002', categoria: 'Medicamento', stock: 85, fechaVencimiento: '2026-05-20', precioUnitario: 800 },
  { id: 3, nombre: 'Guantes de Nitrilo (caja x100)', sku: 'INS-001', categoria: 'Insumo', stock: 8, fechaVencimiento: '2027-01-10', precioUnitario: 35000 },
  { id: 4, nombre: 'Jeringa 5 ml (caja x100)', sku: 'INS-002', categoria: 'Insumo', stock: 45, fechaVencimiento: '2027-06-01', precioUnitario: 28000 },
  { id: 5, nombre: 'Tensiómetro Digital', sku: 'EQP-001', categoria: 'Equipo', stock: 3, fechaVencimiento: '2030-12-31', precioUnitario: 185000 },
  { id: 6, nombre: 'Amoxicilina 500 mg', sku: 'MED-003', categoria: 'Medicamento', stock: 5, fechaVencimiento: '2026-03-01', precioUnitario: 1200 },
  { id: 7, nombre: 'Gasa Estéril (paq x10)', sku: 'INS-003', categoria: 'Insumo', stock: 60, fechaVencimiento: '2027-09-15', precioUnitario: 4500 },
  { id: 8, nombre: 'Oxímetro de Pulso', sku: 'EQP-002', categoria: 'Equipo', stock: 7, fechaVencimiento: '2030-12-31', precioUnitario: 95000 },
  { id: 9, nombre: 'Metformina 850 mg', sku: 'MED-004', categoria: 'Medicamento', stock: 200, fechaVencimiento: '2026-11-30', precioUnitario: 950 },
  { id: 10, nombre: 'Alcohol Antiséptico 500 ml', sku: 'INS-004', categoria: 'Insumo', stock: 22, fechaVencimiento: '2026-02-28', precioUnitario: 8500 },
]

/* ── Category badge ───────────────────────────────────── */

const catBadge: Record<Product['categoria'], string> = {
  Medicamento: 'bg-omega-violet/10 text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint',
  Insumo: 'bg-blue-500/10 text-blue-600 dark:bg-blue-400/15 dark:text-blue-400',
  Equipo: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400',
}

/* ── Add Product Modal ────────────────────────────────── */

function AddProductModal({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (p: Omit<Product, 'id'>) => void
}) {
  const [nombre, setNombre] = useState('')
  const [sku, setSku] = useState('')
  const [categoria, setCategoria] = useState<Product['categoria']>('Medicamento')
  const [stock, setStock] = useState('')
  const [fecha, setFecha] = useState('')
  const [precio, setPrecio] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !sku.trim() || !stock || !precio) return
    onSave({
      nombre: nombre.trim(),
      sku: sku.trim(),
      categoria,
      stock: Number(stock),
      fechaVencimiento: fecha || '2030-12-31',
      precioUnitario: Number(precio),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-omega-dark dark:text-clinical-white">
            Agregar Producto
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Nombre */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Losartán 50 mg"
              className={inputClass}
            />
          </div>

          {/* SKU */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              SKU (Código) *
            </label>
            <input
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej. MED-005"
              className={inputClass}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Product['categoria'])}
              className={inputClass}
            >
              <option value="Medicamento">Medicamento</option>
              <option value="Insumo">Insumo</option>
              <option value="Equipo">Equipo</option>
            </select>
          </div>

          {/* Stock */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Stock Inicial *
            </label>
            <input
              type="number"
              required
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Precio */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Precio Unitario (COP) *
            </label>
            <input
              type="number"
              required
              min={1}
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              placeholder="0"
              className={inputClass}
            />
          </div>

          {/* Fecha vencimiento */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Fecha de Vencimiento
            </label>
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
            Agregar
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function Inventory() {
  const [products, setProducts] = usePersistentState<Product[]>('beta_inventory', defaultProducts)
  const [modalOpen, setModalOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState<'todos' | Product['categoria']>('todos')

  const filtered = useMemo(() => {
    let list = products
    if (catFilter !== 'todos') list = list.filter((p) => p.categoria === catFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
    }
    return list
  }, [products, catFilter, query])

  const summary = useMemo(() => {
    const lowStock = products.filter((p) => p.stock < 10).length
    const expiringSoon = products.filter((p) => daysUntil(p.fechaVencimiento) <= 30).length
    return { total: products.length, lowStock, expiringSoon }
  }, [products])

  function handleAdd(p: Omit<Product, 'id'>) {
    setProducts((prev) => [{ ...p, id: Date.now() }, ...prev])
    setModalOpen(false)
    toast.success('Producto agregado al inventario')
  }

  function adjustStock(id: number, delta: number) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Inventario</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Control de productos, insumos y equipos
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
        >
          <Plus size={18} />
          Agregar Producto
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-omega-violet via-beta-mint to-omega-violet" />
          <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            Total Productos
          </p>
          <p className="mt-2 text-2xl font-bold text-omega-dark dark:text-clinical-white">
            {summary.total}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-alert-red" />
          <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            Stock Bajo (&lt;10)
          </p>
          <p className={`mt-2 text-2xl font-bold ${summary.lowStock > 0 ? 'text-alert-red' : 'text-omega-dark dark:text-clinical-white'}`}>
            {summary.lowStock}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-amber-400" />
          <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            Por Vencer (&le;30 días)
          </p>
          <p className={`mt-2 text-2xl font-bold ${summary.expiringSoon > 0 ? 'text-amber-500' : 'text-omega-dark dark:text-clinical-white'}`}>
            {summary.expiringSoon}
          </p>
        </div>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-omega-dark/40 dark:text-clinical-white/30"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o SKU…"
            className="w-full rounded-xl border border-omega-violet/20 bg-white py-2.5 pl-10 pr-4 text-sm text-omega-dark outline-none transition-shadow placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-omega-violet/20 bg-white p-1 dark:border-clinical-white/10 dark:bg-omega-surface">
          {(['todos', 'Medicamento', 'Insumo', 'Equipo'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                catFilter === c
                  ? 'bg-omega-violet text-clinical-white'
                  : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              {c === 'todos' ? 'Todos' : c + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Producto</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 sm:table-cell dark:text-clinical-white/50">SKU</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 md:table-cell dark:text-clinical-white/50">Categoría</th>
                <th className="px-5 py-3 text-center font-medium text-omega-dark/70 dark:text-clinical-white/50">Stock</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 lg:table-cell dark:text-clinical-white/50">Vencimiento</th>
                <th className="hidden px-5 py-3 text-right font-medium text-omega-dark/70 sm:table-cell dark:text-clinical-white/50">Precio Unit.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const lowStock = p.stock < 10
                const days = daysUntil(p.fechaVencimiento)
                const expiring = days <= 30
                const expired = days < 0

                return (
                  <tr
                    key={p.id}
                    className={`border-b transition-colors last:border-0 ${
                      lowStock
                        ? 'border-alert-red/20 bg-alert-red/[0.04] hover:bg-alert-red/[0.07] dark:border-alert-red/10 dark:bg-alert-red/[0.06] dark:hover:bg-alert-red/[0.09]'
                        : 'border-omega-violet/5 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5'
                    }`}
                  >
                    {/* Nombre */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-omega-violet/10 dark:bg-omega-violet/25">
                          <Package size={16} className="text-omega-violet dark:text-beta-mint" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-omega-dark dark:text-clinical-white">{p.nombre}</p>
                          <p className="text-xs text-omega-dark/40 sm:hidden dark:text-clinical-white/30">{p.sku}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="hidden px-5 py-3 font-mono text-xs text-omega-dark/60 sm:table-cell dark:text-clinical-white/50">
                      {p.sku}
                    </td>

                    {/* Categoría */}
                    <td className="hidden px-5 py-3 md:table-cell">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${catBadge[p.categoria]}`}>
                        {p.categoria}
                      </span>
                    </td>

                    {/* Stock + quick adjust */}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => adjustStock(p.id, -1)}
                          disabled={p.stock === 0}
                          className="rounded-md border border-omega-violet/15 p-1 text-omega-dark/50 transition-colors hover:bg-omega-violet/5 hover:text-omega-dark disabled:opacity-30 dark:border-clinical-white/10 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5 dark:hover:text-clinical-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span
                          className={`min-w-[2.5rem] text-center font-semibold ${
                            lowStock
                              ? 'text-alert-red'
                              : 'text-omega-dark dark:text-clinical-white'
                          }`}
                        >
                          {p.stock}
                        </span>
                        <button
                          onClick={() => adjustStock(p.id, 1)}
                          className="rounded-md border border-omega-violet/15 p-1 text-omega-dark/50 transition-colors hover:bg-omega-violet/5 hover:text-omega-dark dark:border-clinical-white/10 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5 dark:hover:text-clinical-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>

                    {/* Vencimiento */}
                    <td className="hidden px-5 py-3 lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${expired ? 'font-semibold text-alert-red' : expiring ? 'text-amber-600 dark:text-amber-400' : 'text-omega-dark/60 dark:text-clinical-white/50'}`}>
                          {p.fechaVencimiento}
                        </span>
                        {(expiring || expired) && (
                          <AlertTriangle
                            size={15}
                            className={expired ? 'text-alert-red' : 'text-amber-500'}
                          />
                        )}
                      </div>
                    </td>

                    {/* Precio */}
                    <td className="hidden px-5 py-3 text-right font-semibold text-omega-dark/70 sm:table-cell dark:text-clinical-white/60">
                      {fmtCOP(p.precioUnitario)}
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <PackageOpen size={40} className="mx-auto text-omega-dark/20 dark:text-clinical-white/15" />
                    <p className="mt-3 text-sm text-omega-dark/40 dark:text-clinical-white/30">
                      No se encontraron productos
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && <AddProductModal onClose={() => setModalOpen(false)} onSave={handleAdd} />}
    </div>
  )
}
