import { SignUp } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  FileText,
  Video,
  Star,
  Users,
  Lock,
  ShieldCheck,
} from 'lucide-react'

/* ── Data ──────────────────────────────────────────────── */

const features = [
  { icon: CalendarCheck, text: 'Agenda inteligente con IA' },
  { icon: FileText, text: 'Expedientes digitales completos' },
  { icon: Video, text: 'Telemedicina integrada' },
]

/* ── Component ─────────────────────────────────────────── */

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left Panel (visual, hidden on mobile) ────────── */}
      <div className="relative hidden overflow-hidden bg-omega-abyss lg:flex lg:items-center lg:justify-center">
        {/* Gradient orbs */}
        <div
          className="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-[#7C3AED] opacity-[0.18] blur-[120px]"
          style={{ animation: 'float-orb 20s ease-in-out infinite' }}
        />
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[#7FFFD4] opacity-[0.12] blur-[120px]"
          style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
        />
        <div
          className="pointer-events-none absolute right-[10%] top-[30%] h-[350px] w-[350px] rounded-full bg-[#EC4899] opacity-[0.08] blur-[100px]"
          style={{ animation: 'float-orb 18s ease-in-out infinite 5s' }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex max-w-md flex-col gap-10 px-12"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-12 w-auto object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-white">
              Beta <span className="text-beta-mint">Clinic</span>
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
              Tu clínica merece
              <br />
              <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
                lo mejor.
              </span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Gestiona pacientes, citas e historial clínico con la plataforma más moderna de Guatemala.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3.5">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-beta-mint/10">
                  <Icon size={16} className="text-beta-mint" />
                </div>
                <span className="text-sm font-medium text-white/80">{text}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-beta-mint/60" />
              <span className="text-sm font-semibold text-white/70">340+ profesionales</span>
            </div>
            <span className="text-white/20">·</span>
            <span className="text-sm text-white/40">en Guatemala y Centroamérica</span>
          </div>

          {/* Testimonial */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm">
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="fill-beta-mint/80 text-beta-mint/80" />
              ))}
            </div>
            <p className="text-sm italic leading-relaxed text-white/60">
              &ldquo;Beta Clinic transformó la gestión de mi consultorio. Todo está en un solo lugar.&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-beta-mint/20 to-omega-violet/20 text-[10px] font-bold text-beta-mint">
                MF
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70">Dra. María Fernández</p>
                <p className="text-[10px] text-white/35">Odontóloga — Guatemala</p>
              </div>
            </div>
          </div>

          {/* Scarcity badge */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-beta-mint opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-beta-mint" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-beta-mint/50">
              Acceso Beta Limitado
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel (form) ───────────────────────────── */}
      <div className="relative flex items-center justify-center overflow-hidden bg-omega-abyss px-4 py-12">
        {/* Subtle orb for right panel */}
        <div
          className="pointer-events-none absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-[#7C3AED] opacity-[0.08] blur-[120px]"
          style={{ animation: 'float-orb 22s ease-in-out infinite' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-6"
        >
          {/* Mobile-only logo */}
          <div className="flex flex-col items-center gap-2 lg:hidden">
            <div className="flex items-center gap-3">
              <img
                src="/beta-logo.png"
                alt="Beta Clinic"
                className="h-10 w-auto object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                Beta <span className="text-beta-mint">Clinic</span>
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-beta-mint/40">
              Protocolo Omega
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-center text-sm text-white/40">
            Crea tu cuenta en 30 segundos
          </p>

          {/* Glassmorphism card */}
          <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <SignUp
              routing="path"
              path="/sign-up"
              forceRedirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/25">
            <span>14 días gratis</span>
            <span>·</span>
            <span>Sin tarjeta</span>
            <span>·</span>
            <span>Cancela cuando quieras</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-white/20">
            <span className="flex items-center gap-1.5">
              <Lock size={10} />
              Cifrado E2E
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={10} />
              HIPAA Ready
            </span>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-white/15">
            Beta Clinic &copy; {new Date().getFullYear()} — Hecho en Guatemala
          </p>
        </motion.div>
      </div>
    </div>
  )
}
