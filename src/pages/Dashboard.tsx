import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  DollarSign,
  CalendarClock,
  UserRoundCheck,
  SmilePlus,
  Hammer,
  Siren,
  CircuitBoard,
  Baby,
  Syringe,
  HeartPulse,
  ClipboardList,
  Apple,
  TrendingDown,
  Trophy,
  Flame,
  BarChart3,
  type LucideIcon,
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
import { useClinic, type ClinicType } from '../context/ClinicContext'
import { THEME_CONFIG } from '../data/themeConfig'

/* ── Status badge styles ──────────────────────────────── */

const statusBadge: Record<string, string> = {
  Confirmada: 'border-beta-mint/20 bg-beta-mint/10 text-beta-mint',
  Pendiente: 'border-slate-400/20 bg-slate-400/10 text-slate-400',
  Cancelada: 'border-alert-red/20 bg-alert-red/10 text-alert-red',
}

/* ── Motion variants ──────────────────────────────────── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

/* ── Dynamic stats per specialty ──────────────────────── */

interface StatConfig {
  title: string
  value: string
  icon: LucideIcon
}

const DASHBOARD_STATS: Record<ClinicType, (totals: { patients: number; pending: number }) => StatConfig[]> = {
  general: ({ patients, pending }) => [
    { title: 'Total Pacientes', value: String(patients), icon: Users },
    { title: 'Citas Hoy', value: '12', icon: CalendarClock },
    { title: 'Ingresos Mes', value: '$4,500', icon: DollarSign },
    { title: 'Pendientes', value: String(pending), icon: UserRoundCheck },
  ],
  dental: () => [
    { title: 'Tratamientos Activos', value: '38', icon: SmilePlus },
    { title: 'Implantes Mes', value: '7', icon: Hammer },
    { title: 'Ortodoncias', value: '15', icon: CircuitBoard },
    { title: 'Urgencias', value: '3', icon: Siren },
  ],
  pediatrics: () => [
    { title: 'Niños Sanos', value: '64', icon: Baby },
    { title: 'Vacunas Aplicadas', value: '128', icon: Syringe },
    { title: 'Recién Nacidos', value: '5', icon: HeartPulse },
    { title: 'Próx. Revisiones', value: '18', icon: ClipboardList },
  ],
  nutrition: () => [
    { title: 'Pacientes en Plan', value: '42', icon: Apple },
    { title: 'Kilos Perdidos', value: '187', icon: TrendingDown },
    { title: '% Éxito', value: '78%', icon: Trophy },
    { title: 'Nuevos Retos', value: '9', icon: Flame },
  ],
}

/* ── Dynamic chart data per specialty ─────────────────── */

interface ChartConfig {
  title: string
  data: { name: string; value: number }[]
}

const DASHBOARD_CHART: Record<ClinicType, ChartConfig> = {
  general: {
    title: 'Pacientes por Mes',
    data: [
      { name: 'Ene', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 48 },
      { name: 'Abr', value: 61 },
      { name: 'May', value: 55 },
      { name: 'Jun', value: 67 },
    ],
  },
  dental: {
    title: 'Tratamientos Realizados',
    data: [
      { name: 'Ene', value: 32 },
      { name: 'Feb', value: 28 },
      { name: 'Mar', value: 41 },
      { name: 'Abr', value: 37 },
      { name: 'May', value: 44 },
      { name: 'Jun', value: 50 },
    ],
  },
  pediatrics: {
    title: 'Curvas de Crecimiento Registradas',
    data: [
      { name: 'Ene', value: 18 },
      { name: 'Feb', value: 24 },
      { name: 'Mar', value: 20 },
      { name: 'Abr', value: 30 },
      { name: 'May', value: 26 },
      { name: 'Jun', value: 35 },
    ],
  },
  nutrition: {
    title: 'Evolución de Peso Promedio',
    data: [
      { name: 'Ene', value: 82 },
      { name: 'Feb', value: 80 },
      { name: 'Mar', value: 78 },
      { name: 'Abr', value: 76 },
      { name: 'May', value: 74 },
      { name: 'Jun', value: 72 },
    ],
  },
}

/* ── Component ────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate()
  const { patients, appointments } = useData()
  const { clinicType } = useClinic()

  const type = clinicType ?? 'general'
  const palette = THEME_CONFIG[type]

  const stats = useMemo(() => {
    const pending = appointments.filter(a => a.status === 'Pendiente').length
    return DASHBOARD_STATS[type]({ patients: patients.length, pending })
  }, [type, patients.length, appointments])

  const chart = DASHBOARD_CHART[type]

  function handleRowClick(patientName: string) {
    const patient = patients.find((p) => p.nombre === patientName)
    if (patient) {
      navigate(`/pacientes/${patient.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Bienvenido, Comandante <span className="text-beta-mint">Dr. Rodríguez</span>
        </h1>
        <p className="mt-1 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Centro de comando — {palette.label}
        </p>
      </motion.div>

      {/* Stats Grid — stagger entrance */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((s, i) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} index={i} />
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="overflow-hidden rounded-xl border border-white/10 bg-white dark:bg-omega-surface"
      >
        <div className="flex items-center gap-2 border-b border-white/5 px-6 py-4">
          <BarChart3 size={18} className="text-beta-mint" />
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">
            {chart.title}
          </h2>
        </div>
        <div className="px-4 py-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chart.data} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.4)' }}
                axisLine={false}
                tickLine={false}
              />
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

      {/* Appointments Table */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="overflow-hidden rounded-xl border border-white/10 bg-white dark:bg-omega-surface"
      >
        <div className="border-b border-white/5 px-6 py-4">
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Próximas Citas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-black/20">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Paciente</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Hora</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Doctor</th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr
                  key={i}
                  onClick={() => handleRowClick(a.patient)}
                  className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03] dark:hover:bg-clinical-white/[0.04]"
                >
                  <td className="px-6 py-3.5 font-medium text-omega-dark dark:text-clinical-white">{a.patient}</td>
                  <td className="px-6 py-3.5 text-omega-dark/70 dark:text-clinical-white/60">{a.time}</td>
                  <td className="px-6 py-3.5 text-omega-dark/70 dark:text-clinical-white/60">{a.doctor}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${statusBadge[a.status] ?? ''}`}
                    >
                      {a.status}
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
