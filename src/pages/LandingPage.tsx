import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion'
import {
  FileBarChart,
  Video,
  CalendarDays,
  ShieldCheck,
  Zap,
  Globe,
  HeartPulse,
  ArrowRight,
  ChevronRight,
  Check,
  Star,
  Quote,
  Users,
  Clock,
  Activity,
  CreditCard,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import HeroLanding from '../components/HeroLanding'
import { PLANS, currencySymbol, type Currency } from '../data/plans'

/* ── Animation variants ──────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.08 } },
}

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
}

/* ── Animated Counter Component ─────────────────────────── */

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── Sticky Mobile CTA ──────────────────────────────────── */

function StickyMobileCTA({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-omega-abyss/95 px-4 py-3 backdrop-blur-xl sm:hidden"
        >
          <Link
            to="/sign-up"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-beta-mint py-3.5 text-sm font-bold text-omega-abyss shadow-[0_0_20px_rgba(127,255,212,0.2)]"
          >
            Prueba Gratis
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Data ─────────────────────────────────────────────────── */

const socialStats = [
  { value: 340, suffix: '+', label: 'Profesionales activos', icon: Users },
  { value: 12000, suffix: '+', label: 'Pacientes gestionados', icon: Activity },
  { value: 5, suffix: 'hrs', label: 'Ahorradas por semana', icon: Clock },
  { value: 4, suffix: '', label: 'Especialidades', icon: Stethoscope },
]

const testimonials = [
  {
    name: 'Dra. María Fernández',
    role: 'Odontóloga, Guatemala City',
    text: 'Antes perdía 2 horas al día en papeleo. Ahora mi agenda se gestiona sola con la IA.',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Rivera',
    role: 'Pediatra, Antigua Guatemala',
    text: 'Las curvas de crecimiento automáticas me ahorran tiempo valioso con cada paciente.',
    rating: 5,
  },
  {
    name: 'Lic. Ana Morales',
    role: 'Nutricionista, Quetzaltenango',
    text: 'El planificador de comidas con IA es increíble. Mis pacientes están encantados con los planes personalizados.',
    rating: 5,
  },
]

const modules = [
  {
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    desc: 'Calendario semanal con vista por hora, estados de cita en vivo y creación rápida. La IA sugiere horarios óptimos basándose en patrones de asistencia.',
    featured: true,
    gradient: 'from-beta-mint/10 to-omega-violet/5',
  },
  {
    icon: FileBarChart,
    title: 'Reportes & Expedientes',
    desc: 'Genera registros RIPS en JSON, expedientes electrónicos completos y exporta todo en PDF.',
    featured: false,
    gradient: 'from-violet-500/10 to-transparent',
  },
  {
    icon: Video,
    title: 'Telemedicina',
    desc: 'Videollamadas integradas con sala de espera virtual y notas clínicas en tiempo real.',
    featured: false,
    gradient: 'from-sky-500/10 to-transparent',
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

/* ── Pricing data imported from src/data/plans.ts ────────── */

const footerLinks = {
  Producto: ['Características', 'Precios', 'Integraciones', 'Actualizaciones'],
  Empresa: ['Sobre Nosotros', 'Blog', 'Carreras', 'Contacto'],
  Legal: ['Términos de Servicio', 'Política de Privacidad', 'Habeas Data'],
}

/* ── Component ────────────────────────────────────────────── */

export default function LandingPage() {
  const [currency, setCurrency] = useState<Currency>('USD')
  const [showMobileCTA, setShowMobileCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowMobileCTA(window.scrollY > window.innerHeight * 0.8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0F172A] text-clinical-white">
      {/* ─── Hero Section ──────────────────────────────────── */}
      <HeroLanding />

      {/* ─── Social Proof / Stats Section ──────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionReveal}
        className="relative z-10 px-6 py-24"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="mx-auto max-w-5xl">
          {/* Animated counters */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-2 gap-8 sm:grid-cols-4"
          >
            {socialStats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} custom={i} className="text-center">
                <s.icon size={20} className="mx-auto mb-3 text-beta-mint/50" strokeWidth={1.5} />
                <p className="text-4xl font-black text-white sm:text-5xl">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-white/30">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-20 grid gap-5 sm:grid-cols-3"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                custom={i}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 backdrop-blur-sm"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-beta-mint text-beta-mint" />
                  ))}
                </div>
                <Quote size={16} className="mb-2 text-white/10" />
                <p className="text-sm leading-relaxed text-white/50">{t.text}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-omega-violet/30 to-beta-mint/20 text-xs font-bold text-white">
                    {t.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">{t.name}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Módulos — Bento Grid ──────────────────────────── */}
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

          {/* Bento grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2"
          >
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                custom={i}
                className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${m.gradient} p-7 transition-all duration-300 hover:border-beta-mint/25 hover:shadow-[0_0_30px_rgba(127,255,212,0.06)] ${
                  m.featured ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                {/* Glowing border on hover */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: 'linear-gradient(135deg, rgba(127,255,212,0.1) 0%, transparent 50%, rgba(124,58,237,0.1) 100%)',
                  }}
                />

                <div className="relative z-10">
                  <div className={`mb-5 flex items-center justify-center rounded-xl bg-white/[0.05] ${
                    m.featured ? 'h-14 w-14' : 'h-11 w-11'
                  }`}>
                    <m.icon size={m.featured ? 28 : 22} className="text-beta-mint" strokeWidth={1.5} />
                  </div>
                  <h3 className={`font-bold text-white ${m.featured ? 'text-2xl' : 'text-lg'}`}>
                    {m.title}
                  </h3>
                  <p className={`mt-2 leading-relaxed text-white/40 ${m.featured ? 'text-base' : 'text-sm'}`}>
                    {m.desc}
                  </p>

                  {/* Featured card: mini calendar preview */}
                  {m.featured && (
                    <div className="mt-6 rounded-xl border border-white/[0.06] bg-omega-abyss/40 p-4">
                      <div className="grid grid-cols-7 gap-1">
                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
                          <div key={d} className="py-1 text-center text-[10px] font-medium text-white/20">{d}</div>
                        ))}
                        {Array.from({ length: 14 }, (_, idx) => (
                          <div
                            key={idx}
                            className={`rounded py-1.5 text-center text-[10px] ${
                              idx === 5
                                ? 'bg-beta-mint/20 font-bold text-beta-mint'
                                : idx === 8
                                ? 'bg-omega-violet/20 font-bold text-omega-violet'
                                : 'text-white/20'
                            }`}
                          >
                            {idx + 8}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-white/30 transition-colors group-hover:text-beta-mint">
                    Explorar <ChevronRight size={14} />
                  </div>
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
                className="group relative flex gap-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur-sm transition-all duration-300 hover:border-beta-mint/20 hover:bg-white/[0.04]"
              >
                {/* Background icon watermark */}
                <div className="pointer-events-none absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]">
                  <b.icon size={100} strokeWidth={0.5} />
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-beta-mint/10 to-omega-violet/5 shadow-[0_0_15px_rgba(127,255,212,0.05)]">
                  <b.icon size={22} className="text-beta-mint" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">{b.desc}</p>
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

            {/* Currency Toggle */}
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

          {/* Plan Cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-12 grid gap-5 lg:grid-cols-3"
          >
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-colors duration-200 ${
                  plan.highlighted
                    ? 'border-beta-mint/30 bg-[#1A2332] hover:border-beta-mint/50'
                    : 'border-[#1E293B] bg-[#1A2332] hover:border-white/15'
                }`}
              >
                {/* Highlighted card extras */}
                {plan.highlighted && (
                  <>
                    {/* Glow halo */}
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-beta-mint/20 via-transparent to-omega-violet/20" />
                    {/* Badge */}
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                      <span className="flex items-center gap-1.5 rounded-full bg-beta-mint px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-omega-abyss shadow-[0_0_20px_rgba(127,255,212,0.3)]">
                        <Sparkles size={12} />
                        Más Popular
                      </span>
                    </div>
                  </>
                )}

                <div className="relative z-10 flex flex-1 flex-col">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/40">{plan.desc}</p>

                  {/* Price */}
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
                  <Link
                    to={`/checkout?plan=${plan.id}&currency=${currency}`}
                    className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? 'bg-beta-mint text-[#0F172A] hover:bg-beta-mint/90'
                        : 'border border-[#1E293B] text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  {/* Trust signals */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 text-[10px] text-white/25">
                      <ShieldCheck size={10} /> Sin tarjeta requerida
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-white/25">
                      <CreditCard size={10} /> Cancela cuando quieras
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Final CTA Band ────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionReveal}
        className="relative z-10 overflow-hidden px-6 py-32"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-omega-violet/[0.08] to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-beta-mint/[0.04] blur-[120px]" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative mx-auto max-w-3xl text-center"
        >
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-beta-mint/70">
            Únete a 340+ clínicas en Guatemala
          </motion.p>

          <motion.h2 variants={fadeUp} custom={1} className="mt-4 text-4xl font-black text-white sm:text-5xl">
            No pierdas más tiempo.
            <br />
            <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
              Empieza hoy.
            </span>
          </motion.h2>

          <motion.p variants={fadeUp} custom={2} className="mx-auto mt-5 max-w-lg text-base text-white/40">
            14 días gratis. Sin tarjeta de crédito. Configuración en menos de 2 minutos.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/sign-up"
              className="group flex items-center gap-2.5 rounded-full bg-beta-mint px-10 py-4 text-base font-bold text-omega-abyss shadow-[0_0_40px_rgba(127,255,212,0.25)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(127,255,212,0.35)]"
            >
              Empezar Ahora
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#modulos"
              className="flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-semibold text-white/60 transition-colors hover:border-white/25 hover:text-white"
            >
              Ver Demo
              <ChevronRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-6 pb-10 pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-beta-mint/20 to-transparent" />

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <img src="/beta-logo.png" alt="Beta Clinic" className="h-8 w-auto object-contain" />
                <span className="text-lg font-bold tracking-tight text-white">
                  Beta <span className="text-beta-mint">Clinic</span>
                </span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/30">
                Gestión clínica de nueva generación para dentistas, pediatras y nutricionistas en Guatemala.
              </p>
              <p className="mt-3 text-xs font-medium italic text-white/20">
                &ldquo;No somos los más baratos. Somos los más inteligentes.&rdquo;
              </p>
              {/* Beta badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-omega-violet/30 bg-omega-violet/10 px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-omega-violet opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-omega-violet" />
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-omega-violet">
                  ACCESO BETA LIMITADO
                </span>
              </div>
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
                      <span className="cursor-pointer text-sm text-white/30 transition-colors hover:text-beta-mint">
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
              &copy; {new Date().getFullYear()} Beta Clinic &mdash; Protocolo Omega. Hecho con &hearts; en Guatemala.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                <span
                  key={social}
                  className="cursor-pointer text-xs text-white/25 transition-colors hover:text-beta-mint"
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Sticky Mobile CTA ─────────────────────────────── */}
      <StickyMobileCTA visible={showMobileCTA} />
    </div>
  )
}
