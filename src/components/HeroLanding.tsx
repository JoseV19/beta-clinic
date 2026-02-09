import { useState, useEffect } from 'react'
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
  Contrast,
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

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

const navLinks = ['Módulos', 'Beneficios', 'Precios']

const stats = [
  { icon: Stethoscope, value: '4', label: 'Especialidades' },
  { icon: Brain, value: 'Gemini', label: 'IA Integrada' },
  { icon: CalendarCheck, value: '24/7', label: 'Disponibilidad' },
  { icon: ShieldCheck, value: '100%', label: 'Seguro' },
]

const avatarColors = [
  'bg-gradient-to-br from-violet-400 to-violet-600',
  'bg-gradient-to-br from-sky-400 to-sky-600',
  'bg-gradient-to-br from-rose-400 to-rose-600',
  'bg-gradient-to-br from-emerald-400 to-emerald-600',
]
const avatarInitials = ['DR', 'ML', 'AC', 'JP']

/* ── Component ─────────────────────────────────────────── */

export default function HeroLanding() {
  const [scrolled, setScrolled] = useState(false)
  const { monochrome, toggleMonochrome } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

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
      <div className="absolute inset-0 bg-black/55" />

      {/* ── Animated gradient mesh overlay ─────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 -top-1/4 h-[60%] w-[60%] rounded-full bg-omega-violet/[0.08] blur-[100px]"
          style={{ animation: 'mesh-drift 20s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] rounded-full bg-beta-mint/[0.06] blur-[120px]"
          style={{ animation: 'mesh-drift 25s ease-in-out infinite reverse' }}
        />
        <div
          className="absolute left-1/3 top-1/3 h-[40%] w-[40%] rounded-full bg-omega-violet/[0.04] blur-[80px]"
          style={{ animation: 'mesh-drift 18s ease-in-out infinite 5s' }}
        />
      </div>

      {/* ── Glassmorphism Navbar ───────────────────────────── */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 px-6 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-omega-abyss/70 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl'
            : 'bg-transparent py-5'
        }`}
      >
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
              <button
                key={link}
                onClick={() => handleNavClick(link.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                {link}
              </button>
            ))}
          </motion.div>

          {/* Right actions */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={toggleMonochrome}
              className={`hidden rounded-full p-2 transition-colors sm:block ${
                monochrome
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white'
              }`}
              title={monochrome ? 'Modo Color' : 'Modo Monocromático'}
            >
              <Contrast size={16} />
            </button>
            <Link
              to="/sign-in"
              className="hidden text-sm font-medium text-white/50 transition-colors hover:text-white sm:block"
            >
              Acceso Portal
            </Link>
            <Link
              to="/sign-up"
              className="rounded-full bg-beta-mint px-5 py-2 text-sm font-semibold text-omega-abyss shadow-[0_0_20px_rgba(127,255,212,0.2)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(127,255,212,0.3)]"
            >
              Prueba Gratis
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* ── Hero content ──────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-56 pt-28 sm:pb-48">
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
            className="mt-8 text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[96px]"
          >
            Tu Clínica.
            <br />
            <span className="bg-gradient-to-r from-beta-mint via-[#5BE8B5] to-omega-violet bg-clip-text text-transparent">
              Potenciada por IA.
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

          {/* Social proof bar */}
          <motion.div variants={fadeUp} custom={3.5} className="mt-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {avatarColors.map((cls, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-omega-abyss text-[10px] font-bold text-white ${cls}`}
                >
                  {avatarInitials[i]}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white/80">
                Usado por <span className="text-beta-mint">340+</span> profesionales
              </p>
              <p className="text-xs text-white/30">en Guatemala y Centroamérica</p>
            </div>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            variants={fadeUp}
            custom={4.5}
            className="relative mx-auto mt-14 hidden max-w-3xl sm:block"
          >
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-2 shadow-[0_0_80px_rgba(127,255,212,0.08)] backdrop-blur-sm">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-xl bg-white/[0.05] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="mx-auto rounded-md bg-white/[0.05] px-12 py-1 text-[10px] text-white/20">
                  app.betaclinic.com/dashboard
                </div>
              </div>
              {/* Dashboard content */}
              <div className="rounded-b-xl bg-omega-abyss/80 p-6">
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Pacientes Hoy', val: '12', color: 'from-violet-500/20 to-violet-500/5' },
                    { label: 'Citas Activas', val: '8', color: 'from-sky-500/20 to-sky-500/5' },
                    { label: 'Ingresos Mes', val: '$4,230', color: 'from-emerald-500/20 to-emerald-500/5' },
                    { label: 'Satisfacción', val: '98%', color: 'from-rose-500/20 to-rose-500/5' },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-lg border border-white/[0.06] bg-gradient-to-br ${s.color} p-3`}>
                      <p className="text-[10px] text-white/40">{s.label}</p>
                      <p className="mt-1 text-lg font-bold text-white">{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-3">
                  <div className="flex h-24 flex-1 flex-col rounded-lg border border-white/[0.06] bg-gradient-to-br from-omega-surface/50 to-transparent p-3">
                    <p className="text-[10px] text-white/30">Citas esta semana</p>
                    <div className="mt-auto flex items-end gap-1">
                      {[40, 65, 45, 80, 60, 75, 50].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-beta-mint/30" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="h-24 w-1/3 rounded-lg border border-white/[0.06] bg-gradient-to-br from-omega-surface/50 to-transparent p-3">
                    <p className="text-[10px] text-white/30">Próxima cita</p>
                    <p className="mt-2 text-xs font-semibold text-white/70">María López</p>
                    <p className="text-[10px] text-white/30">10:30 AM - Control</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Reflection glow */}
            <div className="pointer-events-none absolute -bottom-12 left-1/2 h-24 w-3/4 -translate-x-1/2 rounded-full bg-beta-mint/[0.06] blur-[60px]" />
          </motion.div>

          {/* Stats row (mobile only — desktop sees the dashboard) */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mx-auto mt-14 grid max-w-lg grid-cols-4 gap-4 sm:hidden"
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
        <div className="relative rounded-2xl border border-white/[0.08] bg-black/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Top glow line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-beta-mint/30 to-transparent" />

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-beta-mint" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              4 pasos para empezar
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

                {/* Connector line */}
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
