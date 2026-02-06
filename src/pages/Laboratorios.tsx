import { useState, type DragEvent } from 'react'
import {
  FlaskConical,
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  TrendingUp,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

interface Exam {
  id: number
  nombre: string
  fecha: string
  estado: 'pendiente' | 'completado'
  doctor: string
}

interface UploadedFile {
  id: number
  name: string
  size: string
  date: string
}

interface TrendPoint {
  fecha: string
  valor: number
}

/* ── Mock data ─────────────────────────────────────────── */

const pacientes = [
  'María García',
  'Carlos López',
  'Ana Torres',
  'Luis Ramírez',
  'Sofía Mendoza',
]

const mockExams: Exam[] = [
  { id: 1, nombre: 'Hemograma completo', fecha: '2026-02-05', estado: 'pendiente', doctor: 'Dr. Rodríguez' },
  { id: 2, nombre: 'Perfil lipídico', fecha: '2026-02-04', estado: 'completado', doctor: 'Dr. Herrera' },
  { id: 3, nombre: 'Glicemia en ayunas', fecha: '2026-02-03', estado: 'completado', doctor: 'Dr. Rodríguez' },
  { id: 4, nombre: 'TSH y T4 libre', fecha: '2026-02-01', estado: 'pendiente', doctor: 'Dra. Martínez' },
  { id: 5, nombre: 'Uroanálisis', fecha: '2026-01-28', estado: 'completado', doctor: 'Dr. Rodríguez' },
  { id: 6, nombre: 'Creatinina sérica', fecha: '2026-01-25', estado: 'completado', doctor: 'Dr. Herrera' },
]

const initialTrend: TrendPoint[] = [
  { fecha: '2025-08', valor: 110 },
  { fecha: '2025-10', valor: 105 },
  { fecha: '2025-12', valor: 98 },
  { fecha: '2026-01', valor: 92 },
  { fecha: '2026-02', valor: 95 },
]

/* ── SVG Line Chart ────────────────────────────────────── */

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-omega-dark/30 dark:text-clinical-white/20">
        Se necesitan al menos 2 puntos
      </div>
    )
  }

  const W = 400
  const H = 160
  const PAD_X = 40
  const PAD_Y = 20
  const chartW = W - PAD_X * 2
  const chartH = H - PAD_Y * 2

  const vals = data.map((d) => d.valor)
  const min = Math.min(...vals) - 10
  const max = Math.max(...vals) + 10
  const range = max - min || 1

  const points = data.map((d, i) => ({
    x: PAD_X + (i / (data.length - 1)) * chartW,
    y: PAD_Y + chartH - ((d.valor - min) / range) * chartH,
    ...d,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_Y + chartH} L${points[0].x},${PAD_Y + chartH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD_Y + chartH - t * chartH
        const val = Math.round(min + t * range)
        return (
          <g key={t}>
            <line x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="currentColor" className="text-omega-dark/10 dark:text-clinical-white/10" strokeDasharray="4 4" />
            <text x={PAD_X - 6} y={y + 3} textAnchor="end" className="fill-omega-dark/40 dark:fill-clinical-white/30 text-[9px]">{val}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#mintGrad)" opacity="0.2" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="#7FFFD4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots & labels */}
      {points.map((p) => (
        <g key={p.fecha}>
          <circle cx={p.x} cy={p.y} r="4" fill="#7FFFD4" stroke="#4A148C" strokeWidth="2" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-omega-dark dark:fill-clinical-white text-[9px] font-semibold">{p.valor}</text>
          <text x={p.x} y={PAD_Y + chartH + 14} textAnchor="middle" className="fill-omega-dark/40 dark:fill-clinical-white/30 text-[8px]">{p.fecha}</text>
        </g>
      ))}

      {/* Gradient def */}
      <defs>
        <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7FFFD4" />
          <stop offset="100%" stopColor="#7FFFD4" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Component ─────────────────────────────────────────── */

export default function Laboratorios() {
  const [paciente, setPaciente] = useState(pacientes[0])
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: 1, name: 'hemograma_2026-02-04.pdf', size: '245 KB', date: '2026-02-04' },
    { id: 2, name: 'perfil_lipidico_2026-01.pdf', size: '180 KB', date: '2026-01-28' },
  ])
  const [dragOver, setDragOver] = useState(false)
  const [trendData, setTrendData] = useState<TrendPoint[]>(initialTrend)
  const [newVal, setNewVal] = useState('')
  const [newFecha, setNewFecha] = useState('')

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    const newFiles: UploadedFile[] = droppedFiles.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      date: new Date().toISOString().split('T')[0],
    }))
    setFiles((prev) => [...newFiles, ...prev])
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (!selected) return
    const newFiles: UploadedFile[] = Array.from(selected).map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: `${(f.size / 1024).toFixed(0)} KB`,
      date: new Date().toISOString().split('T')[0],
    }))
    setFiles((prev) => [...newFiles, ...prev])
    e.target.value = ''
  }

  function removeFile(id: number) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  function addTrendPoint() {
    const val = Number(newVal)
    if (!val || !newFecha) return
    setTrendData((prev) => [...prev, { fecha: newFecha, valor: val }].sort((a, b) => a.fecha.localeCompare(b.fecha)))
    setNewVal('')
    setNewFecha('')
  }

  const inputClass =
    'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Laboratorios</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Gestión de exámenes y resultados
        </p>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
        <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Paciente</label>
        <select value={paciente} onChange={(e) => setPaciente(e.target.value)} className={inputClass}>
          {pacientes.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Left: Exams list ─────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="flex items-center gap-2 border-b border-omega-violet/10 px-5 py-4 dark:border-clinical-white/5">
            <FlaskConical size={18} className="text-omega-violet dark:text-beta-mint" />
            <h2 className="text-base font-semibold text-omega-dark dark:text-clinical-white">
              Exámenes Solicitados
            </h2>
          </div>

          <div className="divide-y divide-omega-violet/5 dark:divide-clinical-white/5">
            {mockExams.map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-omega-violet/[0.02] dark:hover:bg-clinical-white/5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-omega-dark dark:text-clinical-white">{ex.nombre}</p>
                  <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">{ex.fecha} · {ex.doctor}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  ex.estado === 'completado'
                    ? 'bg-beta-mint/15 text-emerald-700 dark:text-beta-mint'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                }`}>
                  {ex.estado === 'completado' ? 'Completado' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Upload area ───────────────────────── */}
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragOver
                ? 'border-beta-mint bg-beta-mint/10 dark:bg-beta-mint/5'
                : 'border-omega-violet/20 bg-white hover:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-surface dark:hover:border-clinical-white/20'
            }`}
          >
            <Upload size={32} className={`mb-3 ${dragOver ? 'text-beta-mint' : 'text-omega-dark/25 dark:text-clinical-white/20'}`} />
            <p className="text-sm font-medium text-omega-dark/70 dark:text-clinical-white/50">
              Arrastra archivos aquí o{' '}
              <label className="cursor-pointer font-semibold text-omega-violet underline decoration-omega-violet/30 hover:decoration-omega-violet dark:text-beta-mint dark:decoration-beta-mint/30 dark:hover:decoration-beta-mint">
                selecciona
                <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
              </label>
            </p>
            <p className="mt-1 text-xs text-omega-dark/40 dark:text-clinical-white/25">PDF, PNG o JPG</p>
          </div>

          {/* Uploaded files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-lg border border-omega-violet/15 bg-white px-4 py-3 dark:border-clinical-white/10 dark:bg-omega-surface"
                >
                  <FileText size={18} className="shrink-0 text-omega-violet dark:text-beta-mint" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-omega-dark dark:text-clinical-white">{f.name}</p>
                    <p className="text-xs text-omega-dark/40 dark:text-clinical-white/30">{f.size} · {f.date}</p>
                  </div>
                  <button className="rounded-lg p-1.5 text-omega-violet/60 transition-colors hover:bg-omega-violet/10 hover:text-omega-violet dark:text-beta-mint/60 dark:hover:bg-beta-mint/10 dark:hover:text-beta-mint">
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => removeFile(f.id)}
                    className="rounded-lg p-1.5 text-omega-dark/30 transition-colors hover:bg-alert-red/10 hover:text-alert-red dark:text-clinical-white/30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Trends section ─────────────────────────────── */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-semibold text-omega-dark dark:text-clinical-white">
            <TrendingUp size={18} className="text-omega-violet dark:text-beta-mint" />
            Tendencias — Glucosa (mg/dL)
          </h2>

          {/* Add value form */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFecha}
              onChange={(e) => setNewFecha(e.target.value)}
              placeholder="YYYY-MM"
              className="w-24 rounded-lg border border-omega-violet/20 bg-clinical-white px-2 py-1.5 text-xs text-omega-dark outline-none focus:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
            />
            <input
              type="number"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              placeholder="Valor"
              className="w-20 rounded-lg border border-omega-violet/20 bg-clinical-white px-2 py-1.5 text-xs text-omega-dark outline-none focus:border-omega-violet/40 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white"
            />
            <button
              onClick={addTrendPoint}
              disabled={!newVal || !newFecha}
              className="flex items-center gap-1 rounded-lg bg-omega-violet px-3 py-1.5 text-xs font-semibold text-clinical-white transition-colors hover:bg-omega-violet/90 disabled:opacity-40"
            >
              <Plus size={14} />
              Agregar
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-lg border border-omega-violet/10 bg-clinical-white p-4 dark:border-clinical-white/5 dark:bg-omega-abyss">
          <TrendChart data={trendData} />
        </div>

        {/* Data table below chart */}
        <div className="mt-4 flex flex-wrap gap-2">
          {trendData.map((d) => (
            <span
              key={d.fecha}
              className="rounded-full border border-omega-violet/15 bg-omega-violet/5 px-3 py-1 text-xs text-omega-dark dark:border-clinical-white/10 dark:bg-omega-violet/15 dark:text-clinical-white"
            >
              {d.fecha}: <strong className="text-beta-mint">{d.valor}</strong> mg/dL
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
