import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  ClipboardList,
  Pill,
  FlaskConical,
  Save,
  MessageCircle,
} from 'lucide-react'
import { useData } from '../context/DataContext'

/* ── WhatsApp helper ───────────────────────────────────── */

function cleanPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('57') ? digits : '57' + digits
}

function WaIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

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

function InfoTab({ patient }: { patient: ReturnType<typeof useData>['patients'][number] }) {
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

function RecetasTab({ patient }: { patient: ReturnType<typeof useData>['patients'][number] }) {
  function handleWhatsAppReceta() {
    const phone = cleanPhone(patient.telefono)
    const medList = mockRecetas
      .map((r) => `- ${r.medicamento}: ${r.dosis} por ${r.duracion}`)
      .join('\n')
    const message = `Hola ${patient.nombre.split(' ')[0]}, aquí está el resumen de su receta:\n${medList}\nAtt: Dr. Rodríguez — Beta Clinic`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="space-y-4">
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

      <button
        onClick={handleWhatsAppReceta}
        className="flex items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2.5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/20"
      >
        <WaIcon size={18} />
        Enviar Receta por WhatsApp
      </button>
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
  const { patients } = useData()
  const [activeTab, setActiveTab] = useState<TabKey>('info')

  const patient = patients.find((p) => p.id === Number(id))

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

        {/* Quick actions */}
        <div className="ml-auto flex gap-2">
          <a
            href={`https://wa.me/${cleanPhone(patient.telefono)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-2 text-sm font-medium text-[#25D366] transition-colors hover:bg-[#25D366]/20"
          >
            <WaIcon size={16} />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <a
            href={`tel:${patient.telefono.replace(/\D/g, '')}`}
            className="flex items-center gap-2 rounded-lg border border-omega-violet/20 px-3 py-2 text-sm font-medium text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5"
          >
            <MessageCircle size={16} />
            <span className="hidden sm:inline">Llamar</span>
          </a>
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
        {activeTab === 'recetas' && <RecetasTab patient={patient} />}
        {activeTab === 'laboratorios' && <LaboratoriosTab />}
      </div>
    </div>
  )
}
