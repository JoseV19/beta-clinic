import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { Plus, Trash2, Printer, Pill, Zap, ClipboardList } from 'lucide-react'
import { useSettings, type ClinicProfile } from '../context/SettingsContext'
import SmartPrescription from '../components/SmartPrescription'

/* ── Types ─────────────────────────────────────────────── */

interface Medicamento {
  id: number
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
  notas: string
}

/* ── Mock patients for selector ────────────────────────── */

const pacientes = [
  'María García — 1.023.456.789',
  'Carlos López — 1.098.765.432',
  'Ana Torres — 1.045.678.901',
  'Luis Ramírez — 1.067.890.123',
  'Sofía Mendoza — 1.034.567.890',
]

/* ── PDF generation ────────────────────────────────────── */

const VIOLET = '#6A1B9A'
const DARK = '#4A148C'

function generatePrescriptionPDF(
  paciente: string,
  medico: string,
  medicamentos: Medicamento[],
  clinicProfile: ClinicProfile,
) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // ── Header ────────────────────────────────────────────
  doc.setFillColor(DARK)
  doc.rect(0, 0, w, 38, 'F')

  doc.setTextColor('#FFFFFF')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(clinicProfile.nombre || 'Beta Clinic', 15, y)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Protocolo Omega — Sistema Clínico', 15, y + 7)

  doc.setFontSize(8)
  doc.setTextColor('#CCCCCC')
  doc.text(`NIT: ${clinicProfile.nit} | Tel: ${clinicProfile.telefono}`, w - 15, y, { align: 'right' })
  doc.text(clinicProfile.direccion, w - 15, y + 7, { align: 'right' })

  y = 48

  // ── Title ─────────────────────────────────────────────
  doc.setTextColor(VIOLET)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RECETA MÉDICA', w / 2, y, { align: 'center' })

  y += 12

  // ── Divider ───────────────────────────────────────────
  doc.setDrawColor(VIOLET)
  doc.setLineWidth(0.5)
  doc.line(15, y, w - 15, y)
  y += 8

  // ── Patient & date info ───────────────────────────────
  doc.setTextColor('#333333')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Paciente:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(paciente, 42, y)

  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', w - 60, y)
  doc.setFont('helvetica', 'normal')
  doc.text(new Date().toLocaleDateString('es-CO'), w - 42, y)

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Médico:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(medico, 42, y)

  y += 10

  // ── Divider ───────────────────────────────────────────
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)
  y += 8

  // ── Medications table ─────────────────────────────────
  const cols = [15, 62, 92, 125, 152]
  const colHeaders = ['Medicamento', 'Dosis', 'Frecuencia', 'Duración', 'Notas']

  // Header row
  doc.setFillColor(VIOLET)
  doc.rect(15, y - 4, w - 30, 8, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  colHeaders.forEach((h, i) => doc.text(h, cols[i] + 2, y + 1))

  y += 8

  // Data rows
  doc.setTextColor('#333333')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  medicamentos.forEach((m, idx) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    const bg = idx % 2 === 0 ? '#F3E5F5' : '#FFFFFF'
    doc.setFillColor(bg)
    doc.rect(15, y - 4, w - 30, 8, 'F')

    doc.text(m.nombre, cols[0] + 2, y + 1)
    doc.text(m.dosis, cols[1] + 2, y + 1)
    doc.text(m.frecuencia, cols[2] + 2, y + 1)
    doc.text(m.duracion, cols[3] + 2, y + 1)
    doc.text(m.notas || '—', cols[4] + 2, y + 1)

    y += 8
  })

  y += 6
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)

  // ── Footer — Signature area ───────────────────────────
  y += 25
  doc.setDrawColor('#999999')
  doc.setLineWidth(0.3)
  doc.line(w / 2 - 40, y, w / 2 + 40, y)
  y += 5
  doc.setTextColor('#666666')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Firma y Sello del Médico', w / 2, y, { align: 'center' })

  y += 15
  doc.setFontSize(7)
  doc.setTextColor('#999999')
  doc.text(
    'Este documento fue generado electrónicamente por Beta Clinic — Protocolo Omega.',
    w / 2,
    y,
    { align: 'center' },
  )

  doc.save(`Receta_${paciente.split('—')[0].trim().replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}

/* ── Component ─────────────────────────────────────────── */

export default function Recetas() {
  const { clinic } = useSettings()
  const [mode, setMode] = useState<'smart' | 'classic'>('smart')
  const [paciente, setPaciente] = useState(pacientes[0])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  // Form fields
  const [nombre, setNombre] = useState('')
  const [dosis, setDosis] = useState('')
  const [frecuencia, setFrecuencia] = useState('')
  const [duracion, setDuracion] = useState('')
  const [notas, setNotas] = useState('')

  function addMed() {
    if (!nombre.trim() || !dosis.trim()) return
    setMedicamentos((prev) => [
      ...prev,
      { id: Date.now(), nombre: nombre.trim(), dosis: dosis.trim(), frecuencia: frecuencia.trim(), duracion: duracion.trim(), notas: notas.trim() },
    ])
    setNombre('')
    setDosis('')
    setFrecuencia('')
    setDuracion('')
    setNotas('')
  }

  function removeMed(id: number) {
    setMedicamentos((prev) => prev.filter((m) => m.id !== id))
  }

  function handlePrint() {
    if (medicamentos.length === 0) return
    generatePrescriptionPDF(paciente, 'Dr. Alejandro Rodríguez — RM-12345', medicamentos, clinic)
  }

  const inputClass =
    'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10'

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Recetas Médicas</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            Prescripción y generación de recetas oficiales
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex overflow-hidden rounded-lg border border-omega-violet/20 dark:border-clinical-white/10">
            <button
              onClick={() => setMode('smart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                mode === 'smart'
                  ? 'bg-omega-violet/10 text-omega-violet dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/50 hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5'
              }`}
            >
              <Zap size={13} />
              Smart
            </button>
            <button
              onClick={() => setMode('classic')}
              className={`flex items-center gap-1.5 border-l border-omega-violet/20 px-3 py-1.5 text-xs font-semibold transition-colors dark:border-clinical-white/10 ${
                mode === 'classic'
                  ? 'bg-omega-violet/10 text-omega-violet dark:bg-beta-mint/10 dark:text-beta-mint'
                  : 'text-omega-dark/50 hover:bg-omega-violet/5 dark:text-clinical-white/40 dark:hover:bg-clinical-white/5'
              }`}
            >
              <ClipboardList size={13} />
              Clásico
            </button>
          </div>
          {mode === 'classic' && (
            <button
              onClick={handlePrint}
              disabled={medicamentos.length === 0}
              className="flex items-center gap-2 rounded-lg bg-beta-mint px-5 py-2.5 text-sm font-bold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
            >
              <Printer size={18} />
              Imprimir
            </button>
          )}
        </div>
      </div>

      {/* Smart mode */}
      {mode === 'smart' && <SmartPrescription />}

      {/* Classic mode */}
      {mode === 'classic' && (<>
      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
          Paciente
        </label>
        <select
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          className={inputClass}
        >
          {pacientes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Prescription form */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-omega-dark dark:text-clinical-white">
          <Pill size={16} className="text-omega-violet dark:text-beta-mint" />
          Agregar Medicamento
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Medicamento *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Losartán 50 mg"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Dosis *
            </label>
            <input
              type="text"
              value={dosis}
              onChange={(e) => setDosis(e.target.value)}
              placeholder="Ej. 1 tableta"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Frecuencia
            </label>
            <input
              type="text"
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
              placeholder="Ej. Cada 12 horas"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Duración
            </label>
            <input
              type="text"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Ej. 30 días"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Notas Adicionales
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej. Tomar con alimentos, evitar alcohol…"
              className={inputClass}
            />
          </div>
        </div>

        <button
          onClick={addMed}
          disabled={!nombre.trim() || !dosis.trim()}
          className="mt-4 flex items-center gap-2 rounded-lg bg-omega-violet px-4 py-2 text-sm font-semibold text-clinical-white transition-colors hover:bg-omega-violet/90 disabled:opacity-40"
        >
          <Plus size={16} />
          Agregar a la Receta
        </button>
      </div>

      {/* Medication list */}
      {medicamentos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
          <div className="flex items-center justify-between border-b border-omega-violet/10 px-6 py-4 dark:border-clinical-white/5">
            <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">
              Medicamentos en la Receta
            </h2>
            <span className="rounded-full bg-omega-violet/10 px-2.5 py-0.5 text-xs font-bold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
              {medicamentos.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                  <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Medicamento</th>
                  <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Dosis</th>
                  <th className="hidden px-5 py-3 font-medium text-omega-dark/70 sm:table-cell dark:text-clinical-white/50">Frecuencia</th>
                  <th className="hidden px-5 py-3 font-medium text-omega-dark/70 md:table-cell dark:text-clinical-white/50">Duración</th>
                  <th className="hidden px-5 py-3 font-medium text-omega-dark/70 lg:table-cell dark:text-clinical-white/50">Notas</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {medicamentos.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                  >
                    <td className="px-5 py-3 font-medium text-omega-dark dark:text-clinical-white">{m.nombre}</td>
                    <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{m.dosis}</td>
                    <td className="hidden px-5 py-3 text-omega-dark/70 sm:table-cell dark:text-clinical-white/60">{m.frecuencia || '—'}</td>
                    <td className="hidden px-5 py-3 text-omega-dark/70 md:table-cell dark:text-clinical-white/60">{m.duracion || '—'}</td>
                    <td className="hidden px-5 py-3 text-omega-dark/70 lg:table-cell dark:text-clinical-white/60">{m.notas || '—'}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => removeMed(m.id)}
                        className="rounded-lg p-1.5 text-omega-dark/30 transition-colors hover:bg-alert-red/10 hover:text-alert-red dark:text-clinical-white/30"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {medicamentos.length === 0 && (
        <div className="rounded-xl border border-dashed border-omega-violet/20 py-16 text-center dark:border-clinical-white/10">
          <Pill size={40} className="mx-auto text-omega-dark/20 dark:text-clinical-white/15" />
          <p className="mt-3 text-sm text-omega-dark/40 dark:text-clinical-white/30">
            Agregue medicamentos para generar la receta
          </p>
        </div>
      )}
      </>)}
    </div>
  )
}
