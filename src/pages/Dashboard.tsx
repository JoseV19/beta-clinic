import { Users, DollarSign, CalendarClock, UserRoundCheck } from 'lucide-react'
import StatsCard from '../components/StatsCard'

const stats = [
  { title: 'Pacientes Hoy', value: '12', icon: Users },
  { title: 'Ingresos Mes', value: '$4,500', icon: DollarSign },
  { title: 'Citas Pendientes', value: '5', icon: CalendarClock },
  { title: 'Total Doctores', value: '8', icon: UserRoundCheck },
]

const appointments = [
  { patient: 'María García', time: '09:00 AM', doctor: 'Dr. Rodríguez', status: 'Confirmada' },
  { patient: 'Carlos López', time: '09:30 AM', doctor: 'Dra. Martínez', status: 'En espera' },
  { patient: 'Ana Torres', time: '10:00 AM', doctor: 'Dr. Rodríguez', status: 'Confirmada' },
  { patient: 'Luis Ramírez', time: '10:30 AM', doctor: 'Dr. Herrera', status: 'Cancelada' },
  { patient: 'Sofía Mendoza', time: '11:00 AM', doctor: 'Dra. Martínez', status: 'En espera' },
  { patient: 'Jorge Castillo', time: '11:30 AM', doctor: 'Dr. Herrera', status: 'Confirmada' },
]

const statusColor: Record<string, string> = {
  Confirmada: 'bg-beta-mint/15 text-emerald-700 dark:text-beta-mint',
  'En espera': 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  Cancelada: 'bg-alert-red/10 text-alert-red',
}

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Bienvenido, Comandante <span className="text-beta-mint">Dr. Rodríguez</span>
        </h1>
        <p className="mt-1 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Centro de comando — Beta Clinic
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatsCard key={s.title} title={s.title} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Appointments Table */}
      <div className="overflow-hidden rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
        <div className="border-b border-omega-violet/10 px-6 py-4 dark:border-clinical-white/5">
          <h2 className="text-lg font-semibold text-omega-dark dark:text-clinical-white">Próximas Citas</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-omega-violet/10 bg-omega-violet/5 dark:border-clinical-white/5 dark:bg-omega-violet/15">
                <th className="px-6 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Paciente</th>
                <th className="px-6 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Hora</th>
                <th className="px-6 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Doctor</th>
                <th className="px-6 py-3 font-medium text-omega-dark/70 dark:text-clinical-white/50">Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr
                  key={i}
                  className="border-b border-omega-violet/5 transition-colors last:border-0 hover:bg-omega-violet/[0.03] dark:border-clinical-white/5 dark:hover:bg-clinical-white/5"
                >
                  <td className="px-6 py-3 font-medium text-omega-dark dark:text-clinical-white">{a.patient}</td>
                  <td className="px-6 py-3 text-omega-dark/70 dark:text-clinical-white/60">{a.time}</td>
                  <td className="px-6 py-3 text-omega-dark/70 dark:text-clinical-white/60">{a.doctor}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
