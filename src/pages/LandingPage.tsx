import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileBarChart,
  Video,
  CalendarDays,
  DollarSign,
  ShieldCheck,
  Zap,
  Globe,
  HeartPulse,
  Play,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Check,
} from 'lucide-react'
import HeroLanding from '../components/HeroLanding'

/* ── Animation variants ──────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionReveal = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/* ── Data ─────────────────────────────────────────────────── */

const modules = [
  {
    icon: FileBarChart,
    title: 'Reportes RIPS',
    desc: 'Genera y exporta registros individuales de prestación de servicios en formato JSON, listos para reportar ante entidades de salud.',
  },
  {
    icon: Video,
    title: 'Telemedicina',
    desc: 'Sala de espera virtual, videollamadas integradas y notas clínicas en tiempo real sin salir de la plataforma.',
  },
  {
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    desc: 'Calendario semanal con vista por hora, estados de cita en vivo y creación rápida de nuevas consultas.',
  },
  {
    icon: DollarSign,
    title: 'Finanzas',
    desc: 'Control total de ingresos y gastos con balance automático, filtros por tipo y registro de movimientos al instante.',
  },
]

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Seguridad Clínica',
    desc: 'Datos protegidos con estándares de salud. Tu información nunca sale de tu control.',
  },
  {
    icon: Zap,
    title: 'Velocidad Extrema',
    desc: 'Interfaz optimizada que carga en menos de 400 ms. Sin esperas, sin fricción.',
  },
  {
    icon: Globe,
    title: 'Acceso desde Cualquier Lugar',
    desc: 'Aplicación web responsive. Funciona en escritorio, tablet y celular sin instalar nada.',
  },
  {
    icon: HeartPulse,
    title: 'Diseñado para Médicos',
    desc: 'Cada flujo fue pensado por y para profesionales de la salud. Cero curva de aprendizaje.',
  },
]

/* ── Pricing data ─────────────────────────────────────────── */

type Currency = 'USD' | 'GTQ'

interface PricingPlan {
  name: string
  prices: Record<Currency, number>
  desc: string
  features: string[]
  highlighted?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Inicial',
    prices: { USD: 19, GTQ: 150 },
    desc: 'Ideal para consultorios independientes que inician su digitalización.',
    features: [
      'Hasta 50 pacientes',
      'Agenda básica',
      'Expediente electrónico',
      'Soporte por email',
    ],
  },
  {
    name: 'Profesional',
    prices: { USD: 39, GTQ: 300 },
    desc: 'Para prácticas en crecimiento que necesitan herramientas avanzadas.',
    features: [
      'Pacientes ilimitados',
      'Telemedicina integrada',
      'Reportes RIPS',
      'Recetas con PDF',
      'Soporte prioritario',
    ],
    highlighted: true,
  },
  {
    name: 'Clínica',
    prices: { USD: 89, GTQ: 700 },
    desc: 'Solución completa para clínicas con múltiples profesionales.',
    features: [
      'Todo en Profesional',
      'Multi-doctor (hasta 15)',
      'Módulo de finanzas',
      'Laboratorios y tendencias',
      'Directorio profesional',
      'Soporte dedicado 24/7',
    ],
  },
]

const currencySymbol: Record<Currency, string> = { USD: '$', GTQ: 'Q' }

const footerLinks = {
  Producto: ['Características', 'Precios', 'Integraciones', 'Actualizaciones'],
  Empresa: ['Sobre Nosotros', 'Blog', 'Carreras', 'Contacto'],
  Legal: ['Términos de Servicio', 'Política de Privacidad', 'Habeas Data'],
}

/* ── Grid pattern style ───────────────────────────────────── */

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
  backgroundSize: '60px 60px',
}

/* ── Component ────────────────────────────────────────────── */

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currency, setCurrency] = useState<Currency>('USD')

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0F172A] text-clinical-white">
      {/* ─── Hero Section (Full-screen video) ────────────── */}
      <HeroLanding />

      {/* ─── Módulos Section ─────────────────────────────── */}
      <motion.section
        id="modulos"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionReveal}
        className="relative z-10 px-6 py-28"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold uppercase tracking-[0.2em] text-beta-mint/70">
              Módulos
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Todo lo que tu clínica necesita
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-base text-white/40">
              Cuatro pilares que cubren desde la atención médica hasta la administración financiera.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-xl border border-[#1E293B] bg-[#1A2332] p-6 transition-colors duration-200 hover:border-beta-mint/25"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[#0F172A]">
                  <m.icon size={22} className="text-beta-mint" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">{m.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-white/30 transition-colors group-hover:text-beta-mint">
                  Explorar <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Benefits Section ────────────────────────────── */}
      <motion.section
        id="beneficios"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionReveal}
        className="relative z-10 px-6 py-28"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold uppercase tracking-[0.2em] text-beta-mint/70">
              Ventajas
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Por qué elegir Beta Clinic
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-base text-white/40">
              No es solo un software clínico. Es la evolución de cómo gestionas tu práctica médica.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-16 grid gap-5 sm:grid-cols-2"
          >
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                variants={fadeUp}
                custom={i}
                className="group flex gap-5 rounded-xl border border-[#1E293B] bg-[#1A2332] p-6 transition-colors duration-200 hover:border-beta-mint/20"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0F172A]">
                  <b.icon size={20} className="text-beta-mint" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/40">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Pricing Section ────────────────────────────── */}
      <motion.section
        id="precios"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionReveal}
        className="relative z-10 px-6 py-28"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p variants={fadeUp} custom={0} className="text-xs font-semibold uppercase tracking-[0.2em] text-beta-mint/70">
              Precios
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              Un plan para cada etapa
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-base text-white/40">
              Sin contratos anuales. Cancela cuando quieras. Todos los planes incluyen actualizaciones gratuitas.
            </motion.p>

            {/* ── Currency Toggle ──────────────────────────── */}
            <motion.div variants={fadeUp} custom={3} className="mt-10 flex justify-center">
              <div className="relative inline-flex rounded-full border border-[#1E293B] bg-[#1A2332] p-1">
                {(['USD', 'GTQ'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className="relative z-10 rounded-full px-6 py-2 text-sm font-bold transition-colors"
                    style={{ color: currency === c ? '#0F172A' : 'rgba(255,255,255,0.4)' }}
                  >
                    {c}
                    {currency === c && (
                      <motion.div
                        layoutId="currency-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-beta-mint"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Plan Cards ─────────────────────────────────── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-12 grid gap-5 lg:grid-cols-3"
          >
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={`relative flex h-full flex-col rounded-xl border p-7 transition-colors duration-200 ${
                  plan.highlighted
                    ? 'border-beta-mint/30 bg-[#1A2332] hover:border-beta-mint/50'
                    : 'border-[#1E293B] bg-[#1A2332] hover:border-white/15'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="absolute right-5 top-5">
                    <span className="rounded-full border border-beta-mint/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-beta-mint">
                      Popular
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/40">{plan.desc}</p>

                {/* Price with animated swap */}
                <div className="mt-6 flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currency}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-black text-beta-mint"
                    >
                      {currencySymbol[currency]}{plan.prices[currency]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm text-white/30">/mes</span>
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/50">
                      <Check size={16} className="mt-0.5 shrink-0 text-beta-mint/60" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`mt-8 w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-beta-mint text-[#0F172A] hover:bg-beta-mint/90'
                      : 'border border-[#1E293B] text-white/60 hover:border-white/20 hover:text-white'
                  }`}
                >
                  Comenzar Ahora
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── CTA Band ────────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionReveal}
        className="relative z-10 px-6 py-28"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold text-white sm:text-4xl">
            Listo para transformar tu clínica?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mx-auto mt-4 max-w-lg text-base text-white/40">
            Únete a las clínicas que ya operan con el Protocolo Omega. Agenda una demo personalizada sin compromiso.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#modulos"
              className="group flex items-center gap-2 rounded-lg bg-beta-mint px-8 py-3.5 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-beta-mint/90"
            >
              Agendar Demo Ahora
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg border border-white/15 px-8 py-3.5 text-sm font-semibold text-white/60 transition-colors hover:border-white/25 hover:text-white"
            >
              Ya tengo cuenta
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 pb-10 pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div>
              <img
                src="/beta-logo.png"
                alt="Beta Clinic"
                className="h-8 w-auto object-contain"
              />
              <p className="mt-4 text-sm leading-relaxed text-white/30">
                Sistema de gestión clínica de nueva generación. Protocolo Omega.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  {title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link}>
                      <span className="cursor-pointer text-sm text-white/30 transition-colors hover:text-white">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} Beta Clinic — Protocolo Omega. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <span
                  key={social}
                  className="cursor-pointer text-xs text-white/25 transition-colors hover:text-white"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
