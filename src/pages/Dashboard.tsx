import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, DollarSign, CalendarClock, UserRoundCheck } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import { useData } from '../context/DataContext'

const statusBadge: Record<string, string> = {
  Confirmada: 'border-beta-mint/20 bg-beta-mint/10 text-beta-mint',
  Pendiente: 'border-slate-400/20 bg-slate-400/10 text-slate-400',
  Cancelada: 'border-alert-red/20 bg-alert-red/10 text-alert-red',
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { patients, appointments } = useData()

  const stats = [
    { title: 'Pacientes Hoy', value: '12', icon: Users },
    { title: 'Ingresos Mes', value: '$4,500', icon: DollarSign },
    { title: 'Citas Pendientes', value: String(appointments.filter((a) => a.status === 'Pendiente').length), icon: CalendarClock },
    { title: 'Total Pacientes', value: String(patients.length), icon: UserRoundCheck },
  ]

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
          Centro de comando — Beta Clinic
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
