import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Download, FileBarChart, Filter } from 'lucide-react'
import {
  generateRipsJSON,
  downloadRipsFile,
} from '../utils/generateRipsJSON'
import type { Consulta } from '../utils/generateRipsJSON'

/* ── Mock consultas ────────────────────────────────────── */

const mockConsultas: Consulta[] = [
  { id: 1,  paciente: 'María García',     identificacion: '1023456789', fecha: '2026-01-05', codigoDiagnostico: 'I10',   diagnostico: 'Hipertensión esencial',        valorConsulta: 50 },
  { id: 2,  paciente: 'Carlos López',     identificacion: '1098765432', fecha: '2026-01-08', codigoDiagnostico: 'M54.5', diagnostico: 'Lumbago no especificado',       valorConsulta: 45 },
  { id: 3,  paciente: 'Ana Torres',       identificacion: '1045678901', fecha: '2026-01-12', codigoDiagnostico: 'J06.9', diagnostico: 'Infección respiratoria aguda',   valorConsulta: 40 },
  { id: 4,  paciente: 'Luis Ramírez',     identificacion: '1067890123', fecha: '2026-01-15', codigoDiagnostico: 'E11.9', diagnostico: 'Diabetes mellitus tipo 2',       valorConsulta: 55 },
  { id: 5,  paciente: 'Sofía Mendoza',    identificacion: '1034567890', fecha: '2026-01-20', codigoDiagnostico: 'K21.0', diagnostico: 'Enfermedad por reflujo gastroesofágico', valorConsulta: 50 },
  { id: 6,  paciente: 'Jorge Castillo',   identificacion: '1056789012', fecha: '2026-01-22', codigoDiagnostico: 'N39.0', diagnostico: 'Infección de vías urinarias',    valorConsulta: 45 },
  { id: 7,  paciente: 'Valentina Ruiz',   identificacion: '1078901234', fecha: '2026-02-01', codigoDiagnostico: 'J45.9', diagnostico: 'Asma no especificada',           valorConsulta: 50 },
  { id: 8,  paciente: 'Andrés Morales',   identificacion: '1089012345', fecha: '2026-02-02', codigoDiagnostico: 'I10',   diagnostico: 'Hipertensión esencial',          valorConsulta: 50 },
  { id: 9,  paciente: 'Camila Herrera',   identificacion: '1012345678', fecha: '2026-02-03', codigoDiagnostico: 'F41.1', diagnostico: 'Trastorno de ansiedad generalizada', valorConsulta: 60 },
  { id: 10, paciente: 'Diego Vargas',     identificacion: '1090123456', fecha: '2026-02-04', codigoDiagnostico: 'M79.3', diagnostico: 'Paniculitis no especificada',     valorConsulta: 45 },
  { id: 11, paciente: 'Isabella Rojas',   identificacion: '1011234567', fecha: '2026-02-05', codigoDiagnostico: 'L50.9', diagnostico: 'Urticaria no especificada',       valorConsulta: 40 },
  { id: 12, paciente: 'Mateo Ríos',       identificacion: '1022345678', fecha: '2026-02-05', codigoDiagnostico: 'K29.7', diagnostico: 'Gastritis no especificada',       valorConsulta: 45 },
]

/* ── Helpers ───────────────────────────────────────────── */

const fmtCurrency = (n: number) =>
  `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/* ── Component ─────────────────────────────────────────── */

export default function ReportesRips() {
  const today = new Date().toISOString().split('T')[0]
  const [desde, setDesde] = useState('2026-01-01')
  const [hasta, setHasta] = useState(today)
  const [generated, setGenerated] = useState(false)

  const filtered = useMemo(
    () => mockConsultas.filter((c) => c.fecha >= desde && c.fecha <= hasta),
    [desde, hasta],
  )

  const ripsData = useMemo(() => generateRipsJSON(filtered), [filtered])

  function handleGenerate() {
    setGenerated(true)
  }

  function handleExport() {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          downloadRipsFile(ripsData)
          resolve()
        }, 2000)
      }),
      {
        loading: 'Generando reporte...',
        success: 'Reporte descargado',
        error: 'Error al generar reporte',
      },
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Reportes RIPS</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Registro Individual de Prestación de Servicios de Salud
        </p>
      </div>

      {/* Date range form */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <h2 className="mb-4 text-sm font-semibold text-omega-dark dark:text-clinical-white">Rango de fechas</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => { setDesde(e.target.value); setGenerated(false) }}
              className="rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => { setHasta(e.target.value); setGenerated(false) }}
              className="rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-omega-violet/40 focus:ring-2 focus:ring-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white dark:focus:border-beta-mint/30 dark:focus:ring-beta-mint/10"
            />
          </div>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 rounded-lg bg-omega-violet px-4 py-2 text-sm font-semibold text-clinical-white transition-colors hover:bg-omega-violet/90"
          >
            <Filter size={16} />
            Generar Reporte
          </button>
        </div>

        {/* Quick stats */}
        <div className="mt-4 flex flex-wrap gap-6 border-t border-omega-violet/10 pt-4 text-sm dark:border-clinical-white/5">
          <div>
            <span className="text-omega-dark/50 dark:text-clinical-white/40">Registros encontrados: </span>
            <span className="font-bold text-omega-dark dark:text-clinical-white">{filtered.length}</span>
          </div>
          <div>
            <span className="text-omega-dark/50 dark:text-clinical-white/40">Valor total: </span>
            <span className="font-bold text-beta-mint">{fmtCurrency(ripsData.valor_total)}</span>
          </div>
        </div>
      </div>

      {/* Summary table */}
      {generated && (
        <>
          <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-omega-violet/10 px-6 py-4 dark:border-clinical-white/5">
              <div className="flex items-center gap-2">
                <FileBarChart size={18} className="text-omega-violet dark:text-beta-mint" />
                <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">
                  Resumen de Exportación
                </h2>
              </div>
              <div className="text-xs text-omega-dark/50 dark:text-clinical-white/40">
                Prestador: <span className="font-medium text-omega-dark dark:text-clinical-white">IPS-BC-001</span>
                {' · '}NIT: <span className="font-medium text-omega-dark dark:text-clinical-white">900.123.456-7</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                    <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">#</th>
                    <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Paciente</th>
                    <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Identificación</th>
                    <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Fecha</th>
                    <th className="px-5 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">CIE-10</th>
                    <th className="hidden px-5 py-3 font-medium text-omega-dark/70 md:table-cell dark:text-clinical-white/50">Diagnóstico</th>
                    <th className="px-5 py-3 text-right font-medium text-omega-dark/70 dark:text-clinical-white/50">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={c.id}
                      className="border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                    >
                      <td className="px-5 py-3 text-omega-dark/40 dark:text-clinical-white/30">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-omega-dark dark:text-clinical-white">{c.paciente}</td>
                      <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{c.identificacion}</td>
                      <td className="px-5 py-3 text-omega-dark/70 dark:text-clinical-white/60">{c.fecha}</td>
                      <td className="px-5 py-3">
                        <span className="rounded bg-omega-violet/10 px-2 py-0.5 text-xs font-mono font-semibold text-omega-violet dark:bg-omega-violet/25 dark:text-beta-mint">
                          {c.codigoDiagnostico}
                        </span>
                      </td>
                      <td className="hidden px-5 py-3 text-omega-dark/70 md:table-cell dark:text-clinical-white/60">{c.diagnostico}</td>
                      <td className="px-5 py-3 text-right font-medium text-omega-dark dark:text-clinical-white">{fmtCurrency(c.valorConsulta)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                    <td colSpan={6} className="px-5 py-3 text-right text-sm font-semibold text-omega-dark dark:text-clinical-white">
                      Total
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-beta-mint">
                      {fmtCurrency(ripsData.valor_total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 rounded-lg bg-beta-mint px-6 py-3 text-sm font-bold text-omega-dark shadow-md shadow-beta-mint/25 transition-all hover:bg-beta-mint/80 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <Download size={18} />
              Exportar RIPS (.json)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
