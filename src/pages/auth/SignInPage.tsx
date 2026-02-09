import { SignIn } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-omega-abyss">
      {/* ── Gradient orbs ──────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#7C3AED] opacity-[0.15] blur-[120px] sm:h-[600px] sm:w-[600px]"
        style={{ animation: 'float-orb 20s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#7FFFD4] opacity-[0.12] blur-[120px] sm:h-[500px] sm:w-[500px]"
        style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
      />
      <div
        className="pointer-events-none absolute right-[15%] top-[40%] h-[300px] w-[300px] rounded-full bg-[#EC4899] opacity-[0.08] blur-[100px]"
        style={{ animation: 'float-orb 18s ease-in-out infinite 5s' }}
      />

      {/* ── Content ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-8 px-4"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-11 w-auto object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              Beta <span className="text-beta-mint">Clinic</span>
            </span>
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-beta-mint/40">
            Protocolo Omega
          </p>
        </div>

        {/* Glassmorphism card */}
        <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <SignIn
            routing="path"
            path="/sign-in"
            forceRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-white/25">
          <span className="flex items-center gap-1.5">
            <Lock size={11} />
            Cifrado de extremo a extremo
          </span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={11} />
            HIPAA Ready
          </span>
        </div>

        {/* Copyright */}
        <p className="text-[10px] text-white/15">
          Beta Clinic &copy; {new Date().getFullYear()} — Hecho en Guatemala
        </p>
      </motion.div>
    </div>
  )
}
