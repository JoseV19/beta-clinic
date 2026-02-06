import { useState } from 'react'
import { jsPDF } from 'jspdf'
import {
  Pill,
  FileText,
  Calendar,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

/* ── WhatsApp icon ──────────────────────────────────────── */

function WaIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ── Mock prescriptions ─────────────────────────────────── */

interface Medicamento {
  nombre: string
  dosis: string
  frecuencia: string
  duracion: string
}

interface Receta {
  id: number
  fecha: string
  doctor: string
  diagnostico: string
  medicamentos: Medicamento[]
  estado: 'activa' | 'vencida'
}

const prescriptions: Receta[] = [
  {
    id: 1,
    fecha: '2026-02-03',
    doctor: 'Dr. Rodríguez',
    diagnostico: 'Hipertensión arterial esencial',
    medicamentos: [
      { nombre: 'Losartán 50 mg', dosis: '1 tableta', frecuencia: 'Cada 24 h', duracion: '30 días' },
      { nombre: 'Amlodipino 5 mg', dosis: '1 tableta', frecuencia: 'Cada 24 h', duracion: '30 días' },
    ],
    estado: 'activa',
  },
  {
    id: 2,
    fecha: '2026-01-15',
    doctor: 'Dra. Martínez',
    diagnostico: 'Infección respiratoria aguda',
    medicamentos: [
      { nombre: 'Ibuprofeno 400 mg', dosis: '1 tableta', frecuencia: 'Cada 8 h', duracion: '5 días' },
      { nombre: 'Omeprazol 20 mg', dosis: '1 cápsula', frecuencia: 'En ayunas', duracion: '10 días' },
      { nombre: 'Amoxicilina 500 mg', dosis: '1 cápsula', frecuencia: 'Cada 8 h', duracion: '7 días' },
    ],
    estado: 'vencida',
  },
  {
    id: 3,
    fecha: '2025-12-10',
    doctor: 'Dr. Rodríguez',
    diagnostico: 'Cefalea tensional',
    medicamentos: [
      { nombre: 'Acetaminofén 500 mg', dosis: '1 tableta', frecuencia: 'Cada 6 h si dolor', duracion: '3 días' },
    ],
    estado: 'vencida',
  },
]

/* ── PDF generator (matches admin panel style) ──────────── */

const VIOLET = '#6A1B9A'
const DARK = '#4A148C'

function generateRecetaPDF(rx: Receta, clinicName: string, clinicNit: string, clinicTel: string, clinicDir: string) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFillColor(DARK)
  doc.rect(0, 0, w, 38, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(clinicName, 15, y)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Protocolo Omega — Sistema Clínico', 15, y + 7)
  doc.setFontSize(8)
  doc.setTextColor('#CCCCCC')
  doc.text(`NIT: ${clinicNit} | Tel: ${clinicTel}`, w - 15, y, { align: 'right' })
  doc.text(clinicDir, w - 15, y + 7, { align: 'right' })

  y = 48
  doc.setTextColor(VIOLET)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('RECETA MÉDICA', w / 2, y, { align: 'center' })

  y += 12
  doc.setDrawColor(VIOLET)
  doc.setLineWidth(0.5)
  doc.line(15, y, w - 15, y)
  y += 8

  // Info
  doc.setTextColor('#333333')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Médico:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.doctor, 42, y)
  doc.setFont('helvetica', 'bold')
  doc.text('Fecha:', w - 60, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.fecha, w - 42, y)

  y += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Diagnóstico:', 15, y)
  doc.setFont('helvetica', 'normal')
  doc.text(rx.diagnostico, 50, y)

  y += 10
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)
  y += 8

  // Table header
  const cols = [15, 65, 100, 140]
  const colHeaders = ['Medicamento', 'Dosis', 'Frecuencia', 'Duración']
  doc.setFillColor(VIOLET)
  doc.rect(15, y - 4, w - 30, 8, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  colHeaders.forEach((h, i) => doc.text(h, cols[i] + 2, y + 1))
  y += 8

  // Rows
  doc.setTextColor('#333333')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  rx.medicamentos.forEach((m, idx) => {
    const bg = idx % 2 === 0 ? '#F3E5F5' : '#FFFFFF'
    doc.setFillColor(bg)
    doc.rect(15, y - 4, w - 30, 8, 'F')
    doc.text(m.nombre, cols[0] + 2, y + 1)
    doc.text(m.dosis, cols[1] + 2, y + 1)
    doc.text(m.frecuencia, cols[2] + 2, y + 1)
    doc.text(m.duracion, cols[3] + 2, y + 1)
    y += 8
  })

  y += 6
  doc.setDrawColor(VIOLET)
  doc.line(15, y, w - 15, y)

  // Signature
  y += 25
  doc.setDrawColor('#999999')
  doc.setLineWidth(0.3)
  doc.line(w / 2 - 40, y, w / 2 + 40, y)
  y += 5
  doc.setTextColor('#666666')
  doc.setFontSize(9)
  doc.text('Firma y Sello del Médico', w / 2, y, { align: 'center' })

  y += 15
  doc.setFontSize(7)
  doc.setTextColor('#999999')
  doc.text('Este documento fue generado electrónicamente por Beta Clinic — Protocolo Omega.', w / 2, y, { align: 'center' })

  doc.save(`Receta_${rx.fecha}_${rx.doctor.replace(/\s/g, '_')}.pdf`)
}

/* ── Component ──────────────────────────────────────────── */

export default function PortalRecetas() {
  const { clinic } = useSettings()
  const [expandedId, setExpandedId] = useState<number | null>(null)

  function handlePDF(rx: Receta) {
    generateRecetaPDF(rx, clinic.nombre, clinic.nit, clinic.telefono, clinic.direccion)
  }

  function handleFarmacia(rx: Receta) {
    const meds = rx.medicamentos.map((m) => `• ${m.nombre} — ${m.dosis}, ${m.frecuencia}, ${m.duracion}`).join('\n')
    const msg = `Hola, quisiera solicitar los siguientes medicamentos de mi receta:\n\n${meds}\n\nReceta del ${rx.fecha} — ${rx.doctor}\nDiagnóstico: ${rx.diagnostico}\n\nGracias.`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  function formatFecha(iso: string) {
    const d = new Date(iso + 'T12:00:00')
    const formatted = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Mis Recetas</h1>
        <p className="mt-0.5 text-xs text-zinc-500">Historial de prescripciones médicas</p>
      </div>

      <div className="space-y-3">
        {prescriptions.map((rx) => {
          const isExpanded = expandedId === rx.id
          return (
            <div
              key={rx.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800/50"
            >
              {/* Header — tappable */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : rx.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-zinc-800"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  rx.estado === 'activa' ? 'bg-beta-mint/15' : 'bg-zinc-700/30'
                }`}>
                  <FileText size={18} className={rx.estado === 'activa' ? 'text-beta-mint' : 'text-zinc-500'} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-zinc-100">{rx.diagnostico}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      rx.estado === 'activa'
                        ? 'bg-beta-mint/15 text-beta-mint'
                        : 'bg-zinc-700/50 text-zinc-500'
                    }`}>
                      {rx.estado}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Stethoscope size={11} />
                      {rx.doctor}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatFecha(rx.fecha)}
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp size={16} className="shrink-0 text-zinc-500" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-zinc-500" />
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-zinc-700/50">
                  {/* Medications */}
                  <div className="space-y-2 p-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Medicamentos
                    </p>
                    {rx.medicamentos.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl bg-zinc-900/60 p-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-beta-mint/10">
                          <Pill size={12} className="text-beta-mint" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{m.nombre}</p>
                          <p className="text-xs text-zinc-500">
                            {m.dosis} · {m.frecuencia} · {m.duracion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-zinc-700/50 px-4 py-3">
                    <button
                      onClick={() => handlePDF(rx)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-beta-mint/30 bg-beta-mint/10 py-2.5 text-xs font-semibold text-beta-mint transition-colors active:bg-beta-mint/20"
                    >
                      <Download size={14} />
                      Ver PDF
                    </button>
                    <button
                      onClick={() => handleFarmacia(rx)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-semibold text-emerald-400 transition-colors active:bg-emerald-500/20"
                    >
                      <WaIcon size={14} />
                      Farmacia
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Info note */}
      <div className="rounded-2xl border border-dashed border-zinc-700 p-4 text-center">
        <Pill size={24} className="mx-auto text-zinc-600" />
        <p className="mt-2 text-xs text-zinc-500">
          Las recetas se sincronizan automáticamente con tu historial clínico
        </p>
      </div>
    </div>
  )
}
