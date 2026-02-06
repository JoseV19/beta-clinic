import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  ClipboardList,
  Pill,
  FlaskConical,
  Save,
} from 'lucide-react'
import { mockPatients } from './PatientList'

/* ── Tabs ──────────────────────────────────────────────── */

const tabs = [
  { key: 'info', label: 'Información General', icon: User },
  { key: 'historial', label: 'Historial Consultas', icon: ClipboardList },
  { key: 'recetas', label: 'Recetas', icon: Pill },
  { key: 'laboratorios', label: 'Laboratorios', icon: FlaskConical },
] as const

type TabKey = (typeof tabs)[number]['key']

/* ── Mock history ──────────────────────────────────────── */

const mockHistory = [
  { fecha: '2026-02-03', motivo: 'Control general', doctor: 'Dr. Rodríguez', diagnostico: 'Hipertensión leve' },
  { fecha: '2026-01-15', motivo: 'Dolor lumbar', doctor: 'Dra. Martínez', diagnostico: 'Lumbalgia mecánica' },
  { fecha: '2025-12-10', motivo: 'Revisión anual', doctor: 'Dr. Rodríguez', diagnostico: 'Sin hallazgos' },
]

const mockRecetas = [
  { fecha: '2026-02-03', medicamento: 'Losartán 50 mg', dosis: '1 tableta/día', duracion: '30 días' },
  { fecha: '2026-01-15', medicamento: 'Ibuprofeno 400 mg', dosis: '1 c/8 h', duracion: '5 días' },
]

const mockLabs = [
  { fecha: '2026-01-20', examen: 'Hemograma completo', resultado: 'Normal', doctor: 'Dr. Rodríguez' },
  { fecha: '2026-01-20', examen: 'Glicemia en ayunas', resultado: '92 mg/dL', doctor: 'Dr. Rodríguez' },
  { fecha: '2025-12-10', examen: 'Perfil lipídico', resultado: 'Colesterol total 210 mg/dL', doctor: 'Dr. Rodríguez' },
]

/* ── Shared table styles ───────────────────────────────── */

const thClass = 'px-4 py-2.5 font-medium text-omega-dark/70 dark:text-clinical-white/50'
const tdClass = 'px-4 py-2.5 text-omega-dark/70 dark:text-clinical-white/60'
const tdBoldClass = 'px-4 py-2.5 font-medium text-omega-dark dark:text-clinical-white'
const theadRowClass = 'border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15'
const tbodyRowClass = 'border-b border-omega-violet/5 last:border-0 dark:border-clinical-white/5'
const tableWrapClass = 'overflow-x-auto rounded-lg border border-omega-violet/10 dark:border-clinical-white/10'

/* ── SOAP form ─────────────────────────────────────────── */

function SoapForm() {
  const [form, setForm] = useState({ subjetivo: '', objetivo: '', analisis: '', plan: '' })
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
  }

  const fields: { key: keyof typeof form; label: string; placeholder: string }[] = [
    { key: 'subjetivo', label: 'Subjetivo (S)', placeholder: 'Motivo de consulta, síntomas reportados por el paciente…' },
    { key: 'objetivo', label: 'Objetivo (O)', placeholder: 'Signos vitales, hallazgos del examen físico…' },
    { key: 'analisis', label: 'Análisis (A)', placeholder: 'Diagnóstico diferencial, interpretación clínica…' },
    { key: 'plan', label: 'Plan (P)', placeholder: 'Tratamiento, medicamentos, seguimiento…' },
  ]

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <h3 className="text-sm font-semibold text-omega-dark dark:text-clinical-white">Nueva Nota Médica — SOAP</h3>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key}>
          <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">{label}</label>
          <textarea
            rows={3}
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none transition-shadow placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
          />
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark transition-colors hover:bg-beta-mint/80"
        >
          <Save size={16} />
          Guardar Nota
        </button>
        {saved && (
          <span className="text-xs font-medium text-emerald-600 dark:text-beta-mint">Nota guardada correctamente</span>
        )}
      </div>
    </form>
  )
}

/* ── Tab panels ────────────────────────────────────────── */

function InfoTab({ patient }: { patient: (typeof mockPatients)[number] }) {
  const rows = [
    ['Nombre completo', patient.nombre],
    ['Documento', patient.documento],
    ['Edad', `${patient.edad} años`],
    ['Género', patient.genero === 'F' ? 'Femenino' : 'Masculino'],
    ['Teléfono', patient.telefono],
    ['Última visita', patient.ultimaVisita],
    ['Estado', patient.estado],
  ]

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-omega-violet/10 bg-clinical-white px-4 py-3 dark:border-clinical-white/10 dark:bg-omega-surface">
          <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">{label}</dt>
          <dd className="mt-1 text-sm font-semibold text-omega-dark dark:text-clinical-white">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function HistorialTab() {
  return (
    <div className="space-y-6">
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Fecha</th>
              <th className={thClass}>Motivo</th>
              <th className={`hidden sm:table-cell ${thClass}`}>Doctor</th>
              <th className={thClass}>Diagnóstico</th>
            </tr>
          </thead>
          <tbody>
            {mockHistory.map((h, i) => (
              <tr key={i} className={tbodyRowClass}>
                <td className={tdClass}>{h.fecha}</td>
                <td className={tdBoldClass}>{h.motivo}</td>
                <td className={`hidden sm:table-cell ${tdClass}`}>{h.doctor}</td>
                <td className={tdClass}>{h.diagnostico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <SoapForm />
      </div>
    </div>
  )
}

function RecetasTab() {
  return (
    <div className={tableWrapClass}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Fecha</th>
            <th className={thClass}>Medicamento</th>
            <th className={thClass}>Dosis</th>
            <th className={`hidden sm:table-cell ${thClass}`}>Duración</th>
          </tr>
        </thead>
        <tbody>
          {mockRecetas.map((r, i) => (
            <tr key={i} className={tbodyRowClass}>
              <td className={tdClass}>{r.fecha}</td>
              <td className={tdBoldClass}>{r.medicamento}</td>
              <td className={tdClass}>{r.dosis}</td>
              <td className={`hidden sm:table-cell ${tdClass}`}>{r.duracion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LaboratoriosTab() {
  return (
    <div className={tableWrapClass}>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Fecha</th>
            <th className={thClass}>Examen</th>
            <th className={thClass}>Resultado</th>
            <th className={`hidden sm:table-cell ${thClass}`}>Doctor</th>
          </tr>
        </thead>
        <tbody>
          {mockLabs.map((l, i) => (
            <tr key={i} className={tbodyRowClass}>
              <td className={tdClass}>{l.fecha}</td>
              <td className={tdBoldClass}>{l.examen}</td>
              <td className={tdClass}>{l.resultado}</td>
              <td className={`hidden sm:table-cell ${tdClass}`}>{l.doctor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function PatientDetail() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState<TabKey>('info')

  const patient = mockPatients.find((p) => p.id === Number(id))

  if (!patient) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-omega-dark/50 dark:text-clinical-white/40">
        <p className="text-lg">Paciente no encontrado</p>
        <Link to="/pacientes" className="mt-3 text-sm font-medium text-omega-violet hover:underline dark:text-beta-mint">
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-4">
        <Link
          to="/pacientes"
          className="rounded-lg border border-omega-violet/20 p-2 text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/60 dark:hover:bg-clinical-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-omega-violet/10 text-sm font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
            {patient.nombre.split(' ').map((n) => n[0]).join('')}
          </span>
          <div>
            <h1 className="text-xl font-bold text-omega-dark dark:text-clinical-white">{patient.nombre}</h1>
            <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
              {patient.documento} · {patient.edad} años
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-omega-violet/20 bg-white p-1 dark:border-clinical-white/10 dark:bg-omega-surface">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-omega-violet text-clinical-white'
                : 'text-omega-dark/60 hover:bg-omega-violet/5 hover:text-omega-dark dark:text-clinical-white/50 dark:hover:bg-clinical-white/5 dark:hover:text-clinical-white'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'info' && <InfoTab patient={patient} />}
        {activeTab === 'historial' && <HistorialTab />}
        {activeTab === 'recetas' && <RecetasTab />}
        {activeTab === 'laboratorios' && <LaboratoriosTab />}
      </div>
    </div>
  )
}
