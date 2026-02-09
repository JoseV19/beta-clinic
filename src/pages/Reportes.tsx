import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { jsPDF } from 'jspdf'
import { toast } from 'sonner'
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  CalendarRange,
  TrendingUp,
  DollarSign,
  Stethoscope,
  CalendarCheck,
  XCircle,
  UserX,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useData } from '../context/DataContext'
import { useSettings } from '../context/SettingsContext'

/* ── Helpers ────────────────────────────────────────────── */

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

const PIE_COLORS = ['#7C3AED', '#7FFFD4', '#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1']

/* ── Component ──────────────────────────────────────────── */

export default function Reportes() {
  const { consultations, invoices, appointments } = useData()
  const { clinic } = useSettings()

  // Date range — default: first of current month → today
  const [desde, setDesde] = useState(() => {
    const d = new Date()
    return toISO(new Date(d.getFullYear(), d.getMonth(), 1))
  })
  const [hasta, setHasta] = useState(() => toISO(new Date()))

  /* ── Filtered data ───────────────────────────────────── */

  const filteredInvoices = useMemo(
    () => invoices.filter(i => i.fecha >= desde && i.fecha <= hasta),
    [invoices, desde, hasta],
  )

  const filteredConsultations = useMemo(
    () => consultations.filter(c => c.fecha >= desde && c.fecha <= hasta),
    [consultations, desde, hasta],
  )

  const filteredAppointments = useMemo(
    () => appointments.filter(a => a.fecha >= desde && a.fecha <= hasta),
    [appointments, desde, hasta],
  )

  /* ── Summary cards ───────────────────────────────────── */

  const summary = useMemo(() => {
    const ingresosTotales = filteredInvoices
      .filter(i => i.estado === 'pagada')
      .reduce((sum, i) => sum + i.total, 0)
    const facturasPagadas = filteredInvoices.filter(i => i.estado === 'pagada').length
    const facturasPendientes = filteredInvoices.filter(i => i.estado === 'emitida').length
    const consultasRealizadas = filteredConsultations.filter(c => c.estado === 'completada').length

    return { ingresosTotales, facturasPagadas, facturasPendientes, consultasRealizadas }
  }, [filteredInvoices, filteredConsultations])

  /* ── Revenue by month chart ──────────────────────────── */

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>()
    filteredInvoices
      .filter(i => i.estado === 'pagada')
      .forEach(i => {
        const month = i.fecha.slice(0, 7) // YYYY-MM
        map.set(month, (map.get(month) ?? 0) + i.total)
      })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        const d = new Date(month + '-01T12:00:00')
        const label = d.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' })
        return { name: label.charAt(0).toUpperCase() + label.slice(1), total }
      })
  }, [filteredInvoices])

  /* ── Top CIE-10 diagnoses ────────────────────────────── */

  const topDiagnoses = useMemo(() => {
    const freq = new Map<string, { codigo: string; descripcion: string; count: number }>()
    filteredConsultations.forEach(c => {
      c.diagnosticoCIE10?.forEach(d => {
        const existing = freq.get(d.codigo)
        if (existing) {
          existing.count++
        } else {
          freq.set(d.codigo, { codigo: d.codigo, descripcion: d.descripcion, count: 1 })
        }
      })
    })
    return Array.from(freq.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [filteredConsultations])

  /* ── Appointment stats ───────────────────────────────── */

  const appointmentStats = useMemo(() => {
    const total = filteredAppointments.length
    const completadas = filteredAppointments.filter(a => a.estado === 'completada').length
    const canceladas = filteredAppointments.filter(a => a.estado === 'cancelada').length
    const noShow = filteredAppointments.filter(a => a.estado === 'no_show').length
    return {
      total,
      completadas,
      canceladas,
      noShow,
      tasaCompletadas: total > 0 ? Math.round((completadas / total) * 100) : 0,
      tasaCanceladas: total > 0 ? Math.round((canceladas / total) * 100) : 0,
      tasaNoShow: total > 0 ? Math.round((noShow / total) * 100) : 0,
    }
  }, [filteredAppointments])

  /* ── Export CSV ──────────────────────────────────────── */

  function handleExportCSV() {
    const headers = ['Fecha', 'Numero', 'Paciente', 'Estado', 'Total']
    const rows = filteredInvoices.map(i => [
      i.fecha,
      i.numero,
      i.pacienteNombre ?? '',
      i.estado,
      String(i.total),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte_${desde}_${hasta}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado')
  }

  /* ── Export PDF ──────────────────────────────────────── */

  function handleExportPDF() {
    const doc = new jsPDF()
    const w = doc.internal.pageSize.getWidth()
    let y = 20

    // Header
    doc.setFillColor('#1A1030')
    doc.rect(0, 0, w, 35, 'F')
    doc.setTextColor('#FFFFFF')
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(clinic.nombre || 'Beta Clinic', 15, y)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Reporte: ${desde} — ${hasta}`, 15, y + 7)

    y = 45
    doc.setTextColor('#333333')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen Financiero', 15, y)
    y += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Ingresos Totales: ${formatCurrency(summary.ingresosTotales)}`, 15, y); y += 6
    doc.text(`Facturas Pagadas: ${summary.facturasPagadas}`, 15, y); y += 6
    doc.text(`Facturas Pendientes: ${summary.facturasPendientes}`, 15, y); y += 6
    doc.text(`Consultas Realizadas: ${summary.consultasRealizadas}`, 15, y); y += 10

    doc.setFont('helvetica', 'bold')
    doc.text('Citas', 15, y); y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`Total: ${appointmentStats.total}`, 15, y); y += 6
    doc.text(`Completadas: ${appointmentStats.completadas} (${appointmentStats.tasaCompletadas}%)`, 15, y); y += 6
    doc.text(`Canceladas: ${appointmentStats.canceladas} (${appointmentStats.tasaCanceladas}%)`, 15, y); y += 6
    doc.text(`No Show: ${appointmentStats.noShow} (${appointmentStats.tasaNoShow}%)`, 15, y); y += 10

    if (topDiagnoses.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.text('Top Diagnósticos CIE-10', 15, y); y += 6
      doc.setFont('helvetica', 'normal')
      topDiagnoses.forEach(d => {
        doc.text(`${d.codigo} — ${d.descripcion} (${d.count})`, 15, y); y += 5
      })
    }

    y += 5
    doc.setFontSize(7)
    doc.setTextColor('#999999')
    doc.text('Generado por Beta Clinic — Protocolo Omega', w / 2, y, { align: 'center' })

    doc.save(`reporte_${desde}_${hasta}.pdf`)
    toast.success('PDF exportado')
  }

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header + date range */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omega-violet/15">
            <BarChart3 className="h-5 w-5 text-omega-violet dark:text-beta-mint" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-omega-dark dark:text-clinical-white">Reportes</h1>
            <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">Análisis financiero y clínico</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-clinical-white/10 bg-omega-surface/50 px-3 py-1.5">
            <CalendarRange size={14} className="text-clinical-white/40" />
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              className="bg-transparent text-xs text-clinical-white outline-none"
            />
            <span className="text-clinical-white/30">—</span>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              className="bg-transparent text-xs text-clinical-white outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-clinical-white/10 bg-omega-surface/50 px-3 py-1.5 text-xs font-medium text-clinical-white/60 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white"
          >
            <FileSpreadsheet size={14} />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg border border-clinical-white/10 bg-omega-surface/50 px-3 py-1.5 text-xs font-medium text-clinical-white/60 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white"
          >
            <FileText size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Ingresos Totales', value: formatCurrency(summary.ingresosTotales), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { title: 'Facturas Pagadas', value: String(summary.facturasPagadas), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { title: 'Facturas Pendientes', value: String(summary.facturasPendientes), icon: Download, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { title: 'Consultas', value: String(summary.consultasRealizadas), icon: Stethoscope, color: 'text-beta-mint', bg: 'bg-beta-mint/10' },
        ].map(({ title, value, icon: Icon, color, bg }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-white p-5 dark:bg-omega-surface"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">{title}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart + Appointment stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by month */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-white dark:bg-omega-surface"
        >
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <TrendingUp size={18} className="text-beta-mint" />
            <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Ingresos por Mes</h2>
          </div>
          <div className="px-4 py-5">
            {revenueByMonth.length === 0 ? (
              <p className="py-10 text-center text-sm text-clinical-white/30">Sin datos de ingresos en este rango</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueByMonth} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1030',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#F8F9FA',
                    }}
                    formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Ingresos']}
                  />
                  <Bar dataKey="total" fill="#7FFFD4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Appointment stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/10 bg-white dark:bg-omega-surface"
        >
          <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
            <CalendarCheck size={18} className="text-beta-mint" />
            <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Estado de Citas</h2>
          </div>
          <div className="space-y-4 px-6 py-5">
            <div className="text-center">
              <p className="text-3xl font-bold text-omega-dark dark:text-clinical-white">{appointmentStats.total}</p>
              <p className="text-xs text-omega-dark/50 dark:text-clinical-white/40">Citas totales en el período</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Completadas', value: appointmentStats.completadas, pct: appointmentStats.tasaCompletadas, icon: CalendarCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                { label: 'Canceladas', value: appointmentStats.canceladas, pct: appointmentStats.tasaCanceladas, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
                { label: 'No Show', value: appointmentStats.noShow, pct: appointmentStats.tasaNoShow, icon: UserX, color: 'text-slate-400', bg: 'bg-slate-400/10' },
              ].map(({ label, value, pct, icon: Icon, color, bg }) => (
                <div key={label} className="rounded-lg border border-white/5 p-3 text-center">
                  <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
                    <Icon size={16} className={color} />
                  </div>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-[10px] text-omega-dark/40 dark:text-clinical-white/30">{label} ({pct}%)</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top CIE-10 diagnoses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/10 bg-white dark:bg-omega-surface"
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
          <Stethoscope size={18} className="text-beta-mint" />
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Top Diagnósticos CIE-10</h2>
        </div>
        <div className="p-6">
          {topDiagnoses.length === 0 ? (
            <p className="py-8 text-center text-sm text-clinical-white/30">
              Sin diagnósticos CIE-10 en este rango. Agrega diagnósticos en las consultas.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie chart */}
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={topDiagnoses}
                      dataKey="count"
                      nameKey="codigo"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={2}
                    >
                      {topDiagnoses.map((_entry, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1A1030',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                        color: '#F8F9FA',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="space-y-2">
                {topDiagnoses.map((d, idx) => (
                  <div key={d.codigo} className="flex items-center gap-3 rounded-lg border border-white/5 px-3 py-2">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-omega-dark dark:text-clinical-white">
                        {d.codigo}
                      </p>
                      <p className="truncate text-xs text-omega-dark/50 dark:text-clinical-white/40">
                        {d.descripcion}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-omega-violet dark:text-beta-mint">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
