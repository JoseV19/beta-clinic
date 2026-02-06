import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario.trim() || !password.trim()) {
      setError(true)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1a0530_0%,_#0a0012_50%,_#000000_100%)]">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-omega-violet/15 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full bg-beta-mint/8 blur-[100px]" />

      {/* Login card */}
      <div className="animate-fade-in relative z-10 mx-4 w-full max-w-md">
        <div className="rounded-2xl border border-beta-mint/15 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
          {/* Subtle top glow line */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-beta-mint/40 to-transparent" />

          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-4">
            <img
              src="/beta-logo.png"
              alt="Beta Clinic"
              className="h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(127,255,212,0.15)]"
            />
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-beta-mint/50">
              Protocolo Omega
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Usuario */}
            <div className="group relative">
              <User
                size={18}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-clinical-white/25 transition-colors group-focus-within:text-beta-mint/70"
              />
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError(false) }}
                placeholder="Usuario"
                className="w-full border-b border-clinical-white/15 bg-transparent py-2.5 pl-8 pr-2 text-sm text-clinical-white outline-none transition-colors placeholder:text-clinical-white/25 focus:border-beta-mint/60"
                autoComplete="username"
              />
              {/* Focus glow underline */}
              <div className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-beta-mint shadow-[0_1px_8px_rgba(127,255,212,0.5)] transition-transform duration-300 group-focus-within:scale-x-100" />
            </div>

            {/* Contraseña */}
            <div className="group relative">
              <Lock
                size={18}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-clinical-white/25 transition-colors group-focus-within:text-beta-mint/70"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                placeholder="Contraseña"
                className="w-full border-b border-clinical-white/15 bg-transparent py-2.5 pl-8 pr-2 text-sm text-clinical-white outline-none transition-colors placeholder:text-clinical-white/25 focus:border-beta-mint/60"
                autoComplete="current-password"
              />
              <div className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-beta-mint shadow-[0_1px_8px_rgba(127,255,212,0.5)] transition-transform duration-300 group-focus-within:scale-x-100" />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-alert-red">
                <AlertCircle size={14} />
                Ingrese usuario y contraseña
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="mt-2 w-full bg-beta-mint py-3 text-sm font-bold uppercase tracking-wider text-omega-dark shadow-lg shadow-beta-mint/20 transition-all [clip-path:polygon(4%_0%,100%_0%,96%_100%,0%_100%)] hover:shadow-xl hover:shadow-beta-mint/30 hover:brightness-110 active:scale-[0.98]"
            >
              Entrar
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-[11px] text-clinical-white/20">
            Beta Clinic &copy; 2026 — Sistema Clínico Protocolo Omega
          </p>
        </div>
      </div>
    </div>
  )
}
