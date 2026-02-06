import { useState } from 'react'
import {
  Plus,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
} from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

interface Professional {
  id: number
  nombre: string
  especialidad: string
  estado: 'disponible' | 'ocupado'
  telefono: string
  email: string
  consultorio: string
  registro: string
  horario: string
}

/* ── Mock data ─────────────────────────────────────────── */

const initialStaff: Professional[] = [
  { id: 1, nombre: 'Dr. Alejandro Rodríguez', especialidad: 'Cardiología', estado: 'disponible', telefono: '310 456 7890', email: 'a.rodriguez@betaclinic.co', consultorio: 'Consultorio 201', registro: 'RM-12345', horario: 'Lun–Vie 7:00–15:00' },
  { id: 2, nombre: 'Dra. Carolina Martínez', especialidad: 'Pediatría', estado: 'ocupado', telefono: '315 123 4567', email: 'c.martinez@betaclinic.co', consultorio: 'Consultorio 105', registro: 'RM-23456', horario: 'Lun–Sáb 8:00–14:00' },
  { id: 3, nombre: 'Dr. Felipe Herrera', especialidad: 'Medicina Interna', estado: 'disponible', telefono: '318 654 3210', email: 'f.herrera@betaclinic.co', consultorio: 'Consultorio 302', registro: 'RM-34567', horario: 'Mar–Sáb 9:00–17:00' },
  { id: 4, nombre: 'Dra. Isabel Vargas', especialidad: 'Dermatología', estado: 'disponible', telefono: '320 987 6543', email: 'i.vargas@betaclinic.co', consultorio: 'Consultorio 108', registro: 'RM-45678', horario: 'Lun–Vie 8:00–16:00' },
  { id: 5, nombre: 'Dr. Sebastián Rojas', especialidad: 'Traumatología', estado: 'ocupado', telefono: '316 345 6789', email: 's.rojas@betaclinic.co', consultorio: 'Consultorio 410', registro: 'RM-56789', horario: 'Lun–Vie 7:00–13:00' },
  { id: 6, nombre: 'Dra. Natalia Ríos', especialidad: 'Ginecología', estado: 'disponible', telefono: '311 234 5678', email: 'n.rios@betaclinic.co', consultorio: 'Consultorio 205', registro: 'RM-67890', horario: 'Lun–Jue 9:00–17:00' },
  { id: 7, nombre: 'Dr. Andrés Morales', especialidad: 'Neurología', estado: 'ocupado', telefono: '319 567 8901', email: 'a.morales@betaclinic.co', consultorio: 'Consultorio 503', registro: 'RM-78901', horario: 'Mar–Sáb 8:00–14:00' },
  { id: 8, nombre: 'Dra. Laura Castillo', especialidad: 'Oftalmología', estado: 'disponible', telefono: '314 876 5432', email: 'l.castillo@betaclinic.co', consultorio: 'Consultorio 112', registro: 'RM-89012', horario: 'Lun–Vie 10:00–18:00' },
]

/* ── Helpers ────────────────────────────────────────────── */

function getInitials(name: string) {
  return name
    .replace(/^(Dr\.|Dra\.)\s*/, '')
    .split(' ')
    .map((w) => w[0])
    .join('')
}

const COLORS = [
  'from-omega-violet to-purple-500',
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-sky-500',
  'from-fuchsia-500 to-purple-500',
  'from-lime-500 to-green-500',
]

/* ── Detail modal ──────────────────────────────────────── */

function DetailModal({
  pro,
  gradient,
  onClose,
}: {
  pro: Professional
  gradient: string
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-omega-violet/20 bg-white shadow-xl dark:border-clinical-white/10 dark:bg-omega-surface">
        {/* Colored header */}
        <div className={`flex flex-col items-center bg-gradient-to-br ${gradient} px-6 pb-10 pt-6`}>
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1 text-white/60 transition-colors hover:text-white"
          >
            <X size={20} />
          </button>

          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold text-white backdrop-blur-sm">
            {getInitials(pro.nombre)}
          </span>
          <h2 className="mt-3 text-lg font-bold text-white">{pro.nombre}</h2>
          <p className="text-sm text-white/80">{pro.especialidad}</p>
          <span className="mt-2 flex items-center gap-1.5 text-xs text-white/70">
            <span
              className={`h-2 w-2 rounded-full ${
                pro.estado === 'disponible' ? 'bg-beta-mint' : 'bg-amber-400'
              }`}
            />
            {pro.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
          </span>
        </div>

        {/* Details */}
        <div className="-mt-4 rounded-t-2xl bg-white px-6 pb-6 pt-5 dark:bg-omega-surface">
          <dl className="space-y-3">
            {[
              { icon: Phone, label: 'Teléfono', value: pro.telefono },
              { icon: Mail, label: 'Email', value: pro.email },
              { icon: MapPin, label: 'Consultorio', value: pro.consultorio },
              { icon: Award, label: 'Registro Médico', value: pro.registro },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-omega-violet dark:text-beta-mint" />
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-omega-dark/40 dark:text-clinical-white/30">
                    {label}
                  </dt>
                  <dd className="text-sm text-omega-dark dark:text-clinical-white">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-lg bg-clinical-white px-3 py-2 text-xs text-omega-dark/60 dark:bg-omega-abyss dark:text-clinical-white/40">
            Horario: {pro.horario}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Main component ────────────────────────────────────── */

export default function Directorio() {
  const [selected, setSelected] = useState<Professional | null>(null)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Directorio Profesional</h1>
          <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
            {initialStaff.length} profesionales registrados
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-beta-mint px-4 py-2 text-sm font-semibold text-omega-dark shadow-md shadow-beta-mint/20 transition-all hover:bg-beta-mint/80 hover:shadow-lg hover:shadow-beta-mint/25 active:scale-[0.97]">
          <Plus size={18} />
          Agregar Profesional
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialStaff.map((pro, i) => {
          const gradient = COLORS[i % COLORS.length]
          return (
            <button
              key={pro.id}
              onClick={() => setSelected(pro)}
              className="group relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white text-left transition-shadow hover:shadow-lg hover:shadow-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:hover:shadow-beta-mint/5"
            >
              {/* Top gradient strip */}
              <div className={`h-20 bg-gradient-to-br ${gradient}`} />

              {/* Avatar */}
              <div className="flex justify-center -mt-8">
                <span className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-lg font-bold text-white ring-4 ring-white dark:ring-omega-surface`}>
                  {getInitials(pro.nombre)}
                </span>
              </div>

              {/* Info */}
              <div className="px-4 pb-5 pt-3 text-center">
                <h3 className="font-semibold text-omega-dark dark:text-clinical-white">
                  {pro.nombre}
                </h3>
                <p className="mt-0.5 text-xs text-omega-violet dark:text-beta-mint/70">
                  {pro.especialidad}
                </p>

                {/* Status */}
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-clinical-white px-2.5 py-1 text-xs font-medium dark:bg-omega-abyss">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      pro.estado === 'disponible'
                        ? 'bg-beta-mint'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-omega-dark/70 dark:text-clinical-white/60">
                    {pro.estado === 'disponible' ? 'Disponible' : 'Ocupado'}
                  </span>
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal
          pro={selected}
          gradient={COLORS[initialStaff.findIndex((p) => p.id === selected.id) % COLORS.length]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
