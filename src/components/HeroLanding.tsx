import { Link } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import {
  UserPlus,
  Landmark,
  Target,
  TrendingUp,
  ArrowRight,
  Stethoscope,
  Brain,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react'

/* ── Animation helpers ─────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/* ── Data ──────────────────────────────────────────────── */

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Crea tu Cuenta Gratis',
    desc: 'Regístrate en 30 segundos. Sin tarjeta de crédito.',
  },
  {
    icon: Landmark,
    step: '02',
    title: 'Configura tu Clínica',
    desc: 'Elige especialidad, sube logo y personaliza tu espacio.',
  },
  {
    icon: Target,
    step: '03',
    title: 'Importa Pacientes',
    desc: 'Migra datos existentes o comienza desde cero.',
  },
  {
    icon: TrendingUp,
    step: '04',
    title: 'Crece con IA',
    desc: 'Gemini optimiza agendas, dietas y diagnósticos.',
  },
]

const navLinks = ['Módulos', 'Precios', 'IA']

const stats = [
  { icon: Stethoscope, value: '4', label: 'Especialidades' },
  { icon: Brain, value: 'Gemini', label: 'IA Integrada' },
  { icon: CalendarCheck, value: '24/7', label: 'Disponibilidad' },
  { icon: ShieldCheck, value: '100%', label: 'Seguro' },
]

/* ── Component ─────────────────────────────────────────── */

export default function HeroLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-omega-abyss">
      {/* ── Background video ──────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none absolute inset-0 h-full w-full origin-top-left scale-150 object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKV/050933_33e2620d-09cd-43a2-80ef-4cdbb42f4194.mp4"
          type="video/mp4"
        />
      </video>

      {/* ── Dark overlay ──────────────────────────────────── */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ── Gradient accents ──────────────────────────────── */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-beta-mint/[0.04] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-60 -right-40 h-[600px] w-[600px] rounded-full bg-omega-violet/[0.06] blur-[140px]" />

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="absolute inset-x-0 top-0 z-50 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-8 w-auto object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-white">
              Beta <span className="text-beta-mint">Clinic</span>
            </span>
          </motion.div>

          {/* Center pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/5 px-1.5 py-1.5 backdrop-blur-md md:flex"
          >
            {navLinks.map(link => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {link}
              </a>
            ))}
          </motion.div>

          {/* Right actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Link
              to="/sign-in"
              className="hidden text-sm font-medium text-white/50 transition-colors hover:text-white sm:block"
            >
              Acceso Portal
            </Link>
            <Link
              to="/sign-up"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-omega-abyss transition-transform hover:scale-105"
            >
              Prueba Gratis
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero content ──────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-48 pt-28">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          {/* AI badge */}
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-beta-mint/20 bg-beta-mint/[0.06] px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-beta-mint opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-beta-mint" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-beta-mint">
                Potenciado por Gemini AI
              </span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-8 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[90px]"
          >
            El Futuro de la
            <br />
            <span className="bg-gradient-to-r from-beta-mint via-beta-mint/80 to-omega-violet bg-clip-text text-transparent">
              Gestión Clínica
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-white/45 sm:text-xl"
          >
            Una plataforma unificada para Dentistas, Pediatras y Nutricionistas.
            Deja que la IA gestione tu agenda mientras tú salvas vidas.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} custom={3} className="mt-10">
            <Link
              to="/sign-up"
              className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-beta-mint px-8 py-4 text-base font-bold text-omega-abyss shadow-[0_0_40px_rgba(127,255,212,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(127,255,212,0.35)]"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Iniciar Protocolo Omega</span>
              <ArrowRight size={18} className="relative transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-14 grid max-w-lg grid-cols-4 gap-4"
          >
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <s.icon size={18} className="mx-auto mb-1.5 text-beta-mint/60" strokeWidth={1.5} />
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom feature card ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-6 bottom-8 z-20 mx-auto max-w-5xl"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-beta-mint" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Cómo funciona
            </p>
          </div>

          {/* Steps grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className="group relative rounded-xl border border-white/[0.05] bg-white/[0.03] p-5 transition-colors duration-300 hover:border-beta-mint/20 hover:bg-beta-mint/[0.04]"
              >
                {/* Step number */}
                <span className="absolute right-4 top-4 text-[40px] font-black leading-none text-white/[0.04] transition-colors group-hover:text-beta-mint/[0.08]">
                  {item.step}
                </span>

                {/* Icon */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-beta-mint/[0.08]">
                  <item.icon size={20} className="text-beta-mint" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/35">{item.desc}</p>

                {/* Connector line (not on last) */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-2 top-1/2 hidden h-px w-4 bg-gradient-to-r from-white/10 to-transparent lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
