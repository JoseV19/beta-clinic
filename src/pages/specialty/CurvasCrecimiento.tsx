import { TrendingUp } from 'lucide-react'

export default function CurvasCrecimiento() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Curvas de Crecimiento</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Seguimiento del desarrollo y crecimiento infantil
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-omega-violet/20 py-24 text-center dark:border-clinical-white/10">
        <TrendingUp size={48} className="mx-auto text-omega-dark/20 dark:text-clinical-white/15" />
        <p className="mt-4 text-sm text-omega-dark/40 dark:text-clinical-white/30">
          Módulo de Curvas de Crecimiento — Próximamente
        </p>
      </div>
    </div>
  )
}
