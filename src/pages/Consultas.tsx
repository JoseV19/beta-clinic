import { useMemo, useState } from 'react'
import {
  Stethoscope,
  Plus,
  X,
  Search,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Save,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import { useData } from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'
import CIE10Autocomplete from '../components/ui/CIE10Autocomplete'
import type { Consultation, ConsultationType, ConsultationStatus, SoapNotes, DiagnosticoCIE10 } from '../types/phase2'

/* ── Constants ─────────────────────────────────────────── */

type Tab = 'todas' | 'pendientes' | 'completadas' | 'canceladas'

const estadoConfig: Record<ConsultationStatus, { label: string; className: string }> = {
  completada: { label: 'Completada', className: 'bg-beta-mint/15 text-emerald-700 dark:text-beta-mint' },
  en_curso:   { label: 'En Curso',   className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' },
  pendiente:  { label: 'Pendiente',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  cancelada:  { label: 'Cancelada',  className: 'bg-alert-red/10 text-alert-red' },
}

const tipoConfig: Record<ConsultationType, { label: string; className: string }> = {
  general:      { label: 'General',      className: 'bg-omega-violet/10 text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint' },
  especialista: { label: 'Especialista', className: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400' },
  urgencia:     { label: 'Urgencia',     className: 'bg-alert-red/10 text-alert-red' },
  control:      { label: 'Control',      className: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  telemedicina: { label: 'Telemedicina', className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400' },
}

const inputClass =
  'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

/* ── Nueva Consulta Modal ──────────────────────────────── */

function NuevaConsultaModal({
  onClose,
  onSave,
  patients,
  defaultDoctor,
}: {
  onClose: () => void
  onSave: (c: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void
  patients: { id: number; nombre: string }[]
  defaultDoctor: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const [patientId, setPatientId] = useState(patients[0]?.id ?? 0)
  const [doctorName, setDoctorName] = useState(defaultDoctor)
  const [fecha, setFecha] = useState(today)
  const [hora, setHora] = useState('')
  const [tipo, setTipo] = useState<ConsultationType>('general')
  const [motivo, setMotivo] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo.trim() || !hora) return
    const patientName = patients.find(p => p.id === patientId)?.nombre ?? 'Desconocido'
    onSave({
      patientId,
      patientName,
      fecha,
      hora,
      motivo: motivo.trim(),
      tipo,
      doctor: doctorName,
      estado: 'pendiente',
    })
  }

  const tipoOptions: { key: ConsultationType; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'especialista', label: 'Especialista' },
    { key: 'urgencia', label: 'Urgencia' },
    { key: 'control', label: 'Control' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-omega-dark dark:text-clinical-white">Nueva Consulta</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Paciente */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Paciente *</label>
            <select value={patientId} onChange={(e) => setPatientId(Number(e.target.value))} className={inputClass}>
              {patients.length === 0 && <option value={0}>Sin pacientes</option>}
              {patients.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          {/* Doctor */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Doctor</label>
            <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className={inputClass} placeholder="Dr. ..." />
          </div>

          {/* Fecha + Hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Hora *</label>
              <input type="time" required value={hora} onChange={(e) => setHora(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Tipo toggle */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Tipo</label>
            <div className="flex gap-2">
              {tipoOptions.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTipo(key)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                    tipo === key
                      ? 'bg-omega-violet text-clinical-white'
                      : 'border border-omega-violet/20 text-omega-dark/60 hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Motivo de consulta *</label>
            <textarea
              rows={3}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo de la consulta..."
              className={`${inputClass} resize-none placeholder:text-omega-dark/30 dark:placeholder:text-clinical-white/25`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-omega-violet/20 px-4 py-2 text-sm font-medium text-omega-dark/60 transition-colors hover:bg-omega-violet/5 dark:border-clinical-white/10 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5">
            Cancelar
          </button>
          <button type="submit" className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2 text-sm font-bold text-omega-dark transition-colors hover:bg-beta-mint/80">
            <Plus size={16} />
            Agendar Consulta
          </button>
        </div>
      </form>
    </div>
  )
}

/* ── Detalle Consulta Modal ────────────────────────────── */

function DetalleConsultaModal({
  consulta,
  onClose,
  onUpdate,
}: {
  consulta: Consultation
  onClose: () => void
  onUpdate: (updated: Consultation) => void
}) {
  const [soap, setSoap] = useState<SoapNotes>(
    consulta.soap ?? { subjetivo: '', objetivo: '', analisis: '', plan: '' },
  )
  const [cie10Codes, setCie10Codes] = useState<DiagnosticoCIE10[]>(
    consulta.diagnosticoCIE10 ?? [],
  )
  const [saved, setSaved] = useState(false)

  function handleSoapChange(field: keyof SoapNotes, value: string) {
    setSoap((s) => ({ ...s, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    onUpdate({ ...consulta, soap, diagnosticoCIE10: cie10Codes })
    setSaved(true)
    toast.success('Nota guardada')
  }

  const soapFields: { key: keyof SoapNotes; label: string; placeholder: string }[] = [
    { key: 'subjetivo', label: 'Subjetivo (S)', placeholder: 'Motivo de consulta, síntomas reportados por el paciente...' },
    { key: 'objetivo',  label: 'Objetivo (O)',  placeholder: 'Signos vitales, hallazgos del examen físico...' },
    { key: 'analisis',  label: 'Análisis (A)',  placeholder: 'Diagnóstico diferencial, interpretación clínica...' },
    { key: 'plan',      label: 'Plan (P)',      placeholder: 'Tratamiento, medicamentos, seguimiento...' },
  ]

  const infoItems = [
    ['Fecha', consulta.fecha],
    ['Hora', consulta.hora],
    ['Paciente', consulta.patientName],
    ['Motivo', consulta.motivo],
    ['Doctor', consulta.doctor],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-omega-violet/20 bg-white p-6 shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-omega-violet/10 text-xs font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
              {consulta.patientName.split(' ').map((n) => n[0]).join('')}
            </span>
            <div>
              <h2 className="text-lg font-bold text-omega-dark dark:text-clinical-white">{consulta.patientName}</h2>
              <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">{consulta.motivo}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-omega-dark/40 transition-colors hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5">
            <X size={20} />
          </button>
        </div>

        {/* Info grid */}
        <dl className="grid gap-3 sm:grid-cols-2">
          {infoItems.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-omega-violet/10 bg-clinical-white px-4 py-3 dark:border-clinical-white/10 dark:bg-omega-abyss">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-omega-dark dark:text-clinical-white">{value}</dd>
            </div>
          ))}
          <div className="rounded-lg border border-omega-violet/10 bg-clinical-white px-4 py-3 dark:border-clinical-white/10 dark:bg-omega-abyss">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">Tipo</dt>
            <dd className="mt-1">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoConfig[consulta.tipo].className}`}>
                {tipoConfig[consulta.tipo].label}
              </span>
            </dd>
          </div>
          <div className="rounded-lg border border-omega-violet/10 bg-clinical-white px-4 py-3 dark:border-clinical-white/10 dark:bg-omega-abyss">
            <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">Estado</dt>
            <dd className="mt-1">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoConfig[consulta.estado].className}`}>
                {estadoConfig[consulta.estado].label}
              </span>
            </dd>
          </div>
          {consulta.diagnosticoCIE10 && consulta.diagnosticoCIE10.length > 0 && (
            <div className="rounded-lg border border-omega-violet/10 bg-clinical-white px-4 py-3 sm:col-span-2 dark:border-clinical-white/10 dark:bg-omega-abyss">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">Diagnóstico CIE-10</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {consulta.diagnosticoCIE10.map(dx => (
                  <span key={dx.codigo} className="inline-flex items-center gap-1 rounded-lg bg-omega-violet/10 px-2.5 py-1 text-xs font-medium text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
                    <span className="font-bold">{dx.codigo}</span>
                    <span className="opacity-70">{dx.descripcion}</span>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {/* Divider */}
        <div className="my-5 border-t border-omega-violet/10 dark:border-clinical-white/5" />

        {/* SOAP Notes */}
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-omega-dark dark:text-clinical-white">
          <Stethoscope size={16} className="text-omega-violet dark:text-beta-mint" />
          Notas Médicas — SOAP
        </h3>

        <div className="space-y-4">
          {soapFields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">{label}</label>
              <textarea
                rows={3}
                value={soap[key]}
                onChange={(e) => handleSoapChange(key, e.target.value)}
                placeholder={placeholder}
                className="w-full resize-none rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none transition-shadow placeholder:text-omega-dark/30 focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:placeholder:text-clinical-white/25 dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
              />
              {key === 'analisis' && (
                <div className="mt-3">
                  <label className="mb-1.5 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
                    Diagnóstico CIE-10
                  </label>
                  <CIE10Autocomplete
                    selectedCodes={cie10Codes}
                    onCodesChange={(codes) => {
                      setCie10Codes(codes)
                      setSaved(false)
                    }}
                    maxCodes={5}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-semibold text-omega-dark transition-colors hover:bg-beta-mint/80"
          >
            <Save size={16} />
            Guardar Nota
          </button>
          {saved && (
            <span className="text-xs font-medium text-emerald-600 dark:text-beta-mint">Nota guardada correctamente</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function Consultas() {
  const { consultations, addConsultation, updateConsultation, patients } = useData()
  const { doctor } = useSettings()
  const [tab, setTab] = useState<Tab>('todas')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedConsulta, setSelectedConsulta] = useState<Consultation | null>(null)

  /* ── Computed ──────────────────────────────────────────── */

  const summary = useMemo(() => {
    const total = consultations.length
    const pendientes = consultations.filter((c) => c.estado === 'pendiente' || c.estado === 'en_curso').length
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const weekStr = oneWeekAgo.toISOString().split('T')[0]
    const completadasSemana = consultations.filter((c) => c.estado === 'completada' && c.fecha >= weekStr).length
    return { total, pendientes, completadasSemana }
  }, [consultations])

  const filtered = useMemo(() => {
    let list = consultations
    if (tab === 'pendientes') list = list.filter((c) => c.estado === 'pendiente' || c.estado === 'en_curso')
    if (tab === 'completadas') list = list.filter((c) => c.estado === 'completada')
    if (tab === 'canceladas') list = list.filter((c) => c.estado === 'cancelada')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.patientName.toLowerCase().includes(q))
    }
    return list
  }, [consultations, tab, search])

  /* ── Handlers ─────────────────────────────────────────── */

  function handleSaveNew(c: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) {
    addConsultation(c)
    setModalOpen(false)
    toast.success('Consulta agendada')
  }

  function handleUpdate(updated: Consultation) {
    updateConsultation(updated)
    setSelectedConsulta(updated)
  }

  /* ── Summary cards config ─────────────────────────────── */

  const summaryCards = [
    { label: 'Total Consultas',       value: summary.total,             icon: ClipboardList, color: 'text-beta-mint' },
    { label: 'Pendientes',            value: summary.pendientes,        icon: Clock,         color: 'text-amber-500 dark:text-amber-400' },
    { label: 'Completadas (semana)',   value: summary.completadasSemana, icon: CheckCircle2,  color: 'text-emerald-500 dark:text-beta-mint' },
  ]

  const tabItems: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
    { key: 'todas',       label: 'Todas',       icon: ClipboardList },
    { key: 'pendientes',  label: 'Pendientes',  icon: Clock },
    { key: 'completadas', label: 'Completadas', icon: CheckCircle2 },
    { key: 'canceladas',  label: 'Canceladas',  icon: XCircle },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Consultas Médicas</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Gestión y seguimiento de consultas clínicas
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]"
        >
          <Plus size={18} />
          Nueva Consulta
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {summaryCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-omega-violet via-beta-mint to-omega-violet" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">{label}</p>
                <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <div className="rounded-lg bg-omega-violet/10 p-2.5 dark:bg-omega-violet/25">
                <Icon size={20} className={color} strokeWidth={1.75} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-omega-dark/30 dark:text-clinical-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre de paciente..."
          className="w-full rounded-xl border border-omega-violet/20 bg-white py-2.5 pl-10 pr-4 text-sm text-omega-dark outline-none transition-shadow focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
        />
      </div>

      {/* Tabs + Table */}
      <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="flex gap-1 border-b border-omega-violet/10 px-4 pt-3 dark:border-clinical-white/5">
          {tabItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-b-2 border-beta-mint bg-beta-mint/10 text-omega-dark dark:text-clinical-white'
                  : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Fecha</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Hora</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Paciente</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 md:table-cell dark:text-clinical-white/50">Motivo</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 sm:table-cell dark:text-clinical-white/50">Tipo</th>
                <th className="hidden px-5 py-3 font-medium text-omega-dark/70 lg:table-cell dark:text-clinical-white/50">Doctor</th>
                <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Estado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedConsulta(c)}
                  className="cursor-pointer border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                >
                  <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{c.fecha}</td>
                  <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{c.hora}</td>
                  <td className="px-5 py-3 font-medium text-omega-dark dark:text-clinical-white">{c.patientName}</td>
                  <td className="hidden px-5 py-3 text-omega-dark/70 md:table-cell dark:text-clinical-white/60">{c.motivo}</td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tipoConfig[c.tipo].className}`}>
                      {tipoConfig[c.tipo].label}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3 text-omega-dark/70 lg:table-cell dark:text-clinical-white/60">{c.doctor}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoConfig[c.estado].className}`}>
                      {estadoConfig[c.estado].label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedConsulta(c) }}
                      className="rounded-lg p-1.5 text-omega-violet/60 transition-colors hover:bg-omega-violet/10 hover:text-omega-violet dark:text-beta-mint/60 dark:hover:bg-beta-mint/10 dark:hover:text-beta-mint"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <Activity size={36} className="mx-auto text-omega-dark/20 dark:text-clinical-white/15" />
                    <p className="mt-2 text-sm text-omega-dark/40 dark:text-clinical-white/30">
                      No se encontraron consultas
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <NuevaConsultaModal
          onClose={() => setModalOpen(false)}
          onSave={handleSaveNew}
          patients={patients}
          defaultDoctor={doctor.nombre}
        />
      )}
      {selectedConsulta && (
        <DetalleConsultaModal
          consulta={selectedConsulta}
          onClose={() => setSelectedConsulta(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  )
}
