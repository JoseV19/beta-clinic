import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { motion, type Variants } from 'framer-motion'
import {
  Stethoscope,
  Smile,
  Baby,
  Apple,
  CalendarCheck,
  MessageSquare,
  Activity,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useClinic, type ClinicType } from '../context/ClinicContext'

/* ── Animation variants ────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Data ──────────────────────────────────────────────── */

interface ModuleCard {
  type: ClinicType
  icon: LucideIcon
  title: string
  desc: string
  color: string
  glow: string
  border: string
  bg: string
}

const modules: ModuleCard[] = [
  {
    type: 'general',
    icon: Stethoscope,
    title: 'Medicina General',
    desc: 'Consultas, recetas, laboratorios y expediente clínico completo.',
    color: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    border: 'hover:border-violet-500/40',
    bg: 'hover:bg-violet-500/[0.06]',
  },
  {
    type: 'dental',
    icon: Smile,
    title: 'Odontología',
    desc: 'Odontograma interactivo, tratamientos y presupuestos dentales.',
    color: 'text-sky-400',
    glow: 'shadow-sky-500/20',
    border: 'hover:border-sky-500/40',
    bg: 'hover:bg-sky-500/[0.06]',
  },
  {
    type: 'pediatrics',
    icon: Baby,
    title: 'Pediatría',
    desc: 'Curvas de crecimiento, esquema de vacunación y control infantil.',
    color: 'text-rose-400',
    glow: 'shadow-rose-500/20',
    border: 'hover:border-rose-500/40',
    bg: 'hover:bg-rose-500/[0.06]',
  },
  {
    type: 'nutrition',
    icon: Apple,
    title: 'Nutrición',
    desc: 'Calculadora metabólica, planes alimenticios con IA Gemini.',
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    border: 'hover:border-emerald-500/40',
    bg: 'hover:bg-emerald-500/[0.06]',
  },
]

const quickStats = [
  { icon: CalendarCheck, label: 'Pacientes citados hoy', value: '12' },
  { icon: MessageSquare, label: 'Mensajes sin leer', value: '3' },
  { icon: Activity, label: 'Estado del Sistema', value: 'Óptimo' },
]

/* ── Grid background style ─────────────────────────────── */

const gridBg = {
  backgroundImage:
    'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
}

/* ── Component ─────────────────────────────────────────── */

export default function WelcomeHub() {
  const { user } = useUser()
  const { setClinicType } = useClinic()
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const firstName = user?.firstName || 'Doctor'

  const formattedDate = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formattedTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })

  function handleSelect(mod: ModuleCard) {
    setClinicType(mod.type)
    toast.success(`Iniciando Protocolo ${mod.title}...`)
    setTimeout(() => navigate('/dashboard'), 600)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-omega-abyss text-white">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 opacity-60" style={gridBg} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-omega-violet/[0.06] blur-[120px]" />

      {/* ── Greeting ──────────────────────────────────────── */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 px-6 pb-4 pt-16 text-center sm:pt-20"
      >
        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-sm font-medium capitalize text-white/40"
        >
          {formattedDate} — {formattedTime}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          custom={1}
          className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
        >
          Bienvenido de nuevo,{' '}
          <span className="bg-gradient-to-r from-beta-mint to-beta-mint/70 bg-clip-text text-transparent">
            Dr. {firstName}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-3 max-w-md text-base text-white/35"
        >
          Selecciona un módulo para iniciar tu sesión clínica.
        </motion.p>
      </motion.header>

      {/* ── Module cards ──────────────────────────────────── */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-10"
      >
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((mod, i) => (
            <motion.button
              key={mod.type}
              variants={fadeUp}
              custom={i}
              onClick={() => handleSelect(mod)}
              className={`group relative flex flex-col items-start rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-left backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:shadow-xl ${mod.border} ${mod.bg} ${mod.glow}`}
            >
              {/* Icon */}
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] transition-colors duration-300 group-hover:bg-white/[0.1] ${mod.color}`}>
                <mod.icon size={24} strokeWidth={1.5} />
              </div>

              {/* Text */}
              <h3 className="text-lg font-bold text-white">{mod.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/35 transition-colors group-hover:text-white/50">
                {mod.desc}
              </p>

              {/* Arrow hint */}
              <div className="mt-auto pt-5">
                <span className={`inline-block text-xs font-semibold uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${mod.color}`}>
                  Iniciar &rarr;
                </span>
              </div>

              {/* Top accent line */}
              <span className="absolute inset-x-6 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-current to-transparent transition-transform duration-300 group-hover:scale-x-100" style={{ color: 'inherit' }} />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* ── Bottom stats bar ──────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="relative z-10 border-t border-white/[0.06] px-6 py-5"
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-8">
          {quickStats.map(stat => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <stat.icon size={16} className="text-beta-mint/50" strokeWidth={1.5} />
              <span className="text-xs text-white/30">{stat.label}:</span>
              <span className="text-xs font-bold text-white/70">{stat.value}</span>
            </div>
          ))}
        </div>
      </motion.footer>
    </div>
  )
}
