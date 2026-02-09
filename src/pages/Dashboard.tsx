import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  DollarSign,
  CalendarClock,
  UserRoundCheck,
  BarChart3,
  CalendarDays,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatsCard from '../components/StatsCard'
import { useData } from '../context/DataContext'
import { useClinic } from '../context/ClinicContext'
import { useSettings } from '../context/SettingsContext'
import { THEME_CONFIG } from '../data/themeConfig'

/* ── Motion variants ──────────────────────────────────── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/* ── Status badge styles ──────────────────────────────── */

const statusBadge: Record<string, string> = {
  confirmada: 'border-beta-mint/20 bg-beta-mint/10 text-beta-mint',
  pendiente: 'border-amber-400/20 bg-amber-400/10 text-amber-400',
  completada: 'border-blue-400/20 bg-blue-400/10 text-blue-400',
  cancelada: 'border-alert-red/20 bg-alert-red/10 text-alert-red',
  no_show: 'border-slate-400/20 bg-slate-400/10 text-slate-400',
}

/* ── Component ────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate()
  const { patients, appointments, consultations, invoices } = useData()
  const { clinicType } = useClinic()
  const { doctor } = useSettings()

  const type = clinicType ?? 'general'
  const palette = THEME_CONFIG[type]
  const today = new Date().toISOString().split('T')[0]

  /* ── Dynamic KPIs ───────────────────────────────────── */

  const stats = useMemo(() => {
    const citasHoy = appointments.filter(a => a.fecha === today).length
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const ingresosMes = invoices
      .filter(i => i.estado === 'pagada' && i.fecha.startsWith(monthStr))
      .reduce((sum, i) => sum + i.total, 0)
    const pendientes = invoices.filter(i => i.estado === 'emitida').length

    return [
      { title: 'Total Pacientes', value: String(patients.length), icon: Users },
      { title: 'Citas Hoy', value: String(citasHoy), icon: CalendarClock },
      { title: 'Ingresos Mes', value: `$${ingresosMes.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, icon: DollarSign },
      { title: 'Pendientes', value: String(pendientes), icon: UserRoundCheck },
    ]
  }, [patients.length, appointments, invoices, today])

  /* ── Chart: consultas por mes (últimos 6) ───────────── */

  const chartData = useMemo(() => {
    const months: { name: string; value: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const name = d.toLocaleDateString('es-GT', { month: 'short' }).replace('.', '')
      const value = consultations.filter(c => c.fecha.startsWith(key)).length
      months.push({ name: name.charAt(0).toUpperCase() + name.slice(1), value })
    }
    return months
  }, [consultations])

  /* ── Upcoming appointments ──────────────────────────── */

  const upcoming = useMemo(
    () => appointments
      .filter(a => a.fecha >= today && a.estado !== 'cancelada')
      .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
      .slice(0, 8),
    [appointments, today],
  )

  function handleRowClick(a: typeof upcoming[number]) {
    const patient = patients.find(p => p.id === a.patientId)
    if (patient) navigate(`/pacientes/${patient.id}`)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Bienvenido, Comandante <span className="text-beta-mint">{doctor.nombre}</span>
        </h1>
        <p className="mt-1 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Centro de comando — {palette.label}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} index={i} />
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="overflow-hidden rounded-xl border border-white/10 bg-white dark:bg-omega-surface">
        <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
          <BarChart3 size={18} className="text-beta-mint" />
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">
            Consultas por Mes
          </h2>
        </div>
        <div className="px-4 py-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1030',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#F8F9FA',
                }}
              />
              <Bar dataKey="value" fill={palette.accent} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Upcoming Appointments Table */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="overflow-hidden rounded-xl border border-white/10 bg-white dark:bg-omega-surface">
        <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
          <CalendarDays size={18} className="text-beta-mint" />
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Próximas Citas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Paciente</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Fecha</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Hora</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Doctor</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Estado</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-clinical-white/30">
                    Sin citas próximas. Crea una desde la Agenda.
                  </td>
                </tr>
              )}
              {upcoming.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => handleRowClick(a)}
                  className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03] dark:hover:bg-clinical-white/[0.04]"
                >
                  <td className="px-6 py-3.5 font-medium text-omega-dark dark:text-clinical-white">{a.patientName}</td>
                  <td className="px-6 py-3.5 text-omega-dark/70 dark:text-clinical-white/60">{a.fecha}</td>
                  <td className="px-6 py-3.5 text-omega-dark/70 dark:text-clinical-white/60">{a.hora}</td>
                  <td className="px-6 py-3.5 text-omega-dark/70 dark:text-clinical-white/60">{a.doctor}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusBadge[a.estado] ?? ''}`}>
                      {a.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
