import { Link } from 'react-router-dom'
import { ShieldX, ArrowLeft } from 'lucide-react'
import { useRole } from '../hooks/useRole'

export default function AccessDenied() {
  const { role, homeRoute } = useRole()

  const labels: Record<string, string> = {
    doctor: 'Dashboard',
    admin: 'Dashboard',
    patient: 'Mi Salud',
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-omega-abyss px-5">
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
          <ShieldX size={40} className="text-red-400" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-clinical-white">Acceso Denegado</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-clinical-white/40">
          No tienes permisos para acceder a esta sección.
          Tu rol actual es <span className="font-semibold text-beta-mint">{role}</span>.
        </p>

        {/* CTA */}
        <Link
          to={homeRoute}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-beta-mint px-6 py-3 text-sm font-bold text-omega-abyss transition-colors hover:bg-beta-mint/80"
        >
          <ArrowLeft size={16} />
          Ir a {labels[role] ?? 'Inicio'}
        </Link>

        {/* Role badge */}
        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-clinical-white/[0.06] bg-clinical-white/[0.02] px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-beta-mint" />
          <span className="text-xs text-clinical-white/30">
            Rol: <span className="font-semibold text-clinical-white/50">{role}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
