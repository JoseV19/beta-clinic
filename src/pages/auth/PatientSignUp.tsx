import { useEffect } from 'react'
import { SignUp, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HeartPulse, Shield, Lock, ShieldCheck } from 'lucide-react'
import { useRole } from '../../hooks/useRole'

/**
 * Patient-specific sign-up page.
 *
 * When a patient completes sign-up through this page, `beta_user_role`
 * is set to `patient` so the app routes them to `/mi-salud`.
 *
 * Doctors share the link: /portal/registro
 */
export default function PatientSignUp() {
  const { isSignedIn } = useAuth()
  const navigate = useNavigate()
  const { setRole } = useRole()

  /* Set patient role on mount (before sign-up completes) */
  useEffect(() => {
    setRole('patient')
  }, [setRole])

  /* If already signed in, go to onboarding (or portal if already onboarded) */
  useEffect(() => {
    if (isSignedIn) {
      const onboarded = localStorage.getItem('beta_patient_onboarded')
      navigate(onboarded ? '/mi-salud' : '/portal/onboarding', { replace: true })
    }
  }, [isSignedIn, navigate])

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-omega-abyss px-4 py-12">
      {/* Gradient orbs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#7C3AED] opacity-[0.15] blur-[120px]"
        style={{ animation: 'float-orb 20s ease-in-out infinite' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-[#7FFFD4] opacity-[0.10] blur-[120px]"
        style={{ animation: 'float-orb 25s ease-in-out infinite reverse' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-6"
      >
        {/* Logo + branding */}
        <div className="flex flex-col items-center gap-2">
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
            Portal de Pacientes
          </p>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-white">
            Tu salud,{' '}
            <span className="bg-gradient-to-r from-beta-mint to-omega-violet bg-clip-text text-transparent">
              en tus manos
            </span>
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Crea tu cuenta para acceder a tu portal de salud
          </p>
        </div>

        {/* Benefits */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-white/50">
          <span className="flex items-center gap-1.5">
            <HeartPulse size={12} className="text-beta-mint" />
            Historial
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <Shield size={12} className="text-beta-mint" />
            Recetas
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <HeartPulse size={12} className="text-beta-mint" />
            Citas
          </span>
        </div>

        {/* Clerk SignUp */}
        <div className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <SignUp
            routing="path"
            path="/portal/registro"
            forceRedirectUrl="/portal/onboarding"
            signInUrl="/sign-in"
          />
        </div>

        {/* Trust signals */}
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

        <p className="text-[10px] text-white/15">
          Beta Clinic &copy; {new Date().getFullYear()} — Hecho en Guatemala
        </p>
      </motion.div>
    </div>
  )
}
