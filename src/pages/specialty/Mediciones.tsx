import { Ruler } from 'lucide-react'

export default function Mediciones() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Mediciones Corporales</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Registro de peso, talla, IMC y composición corporal
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-omega-violet/20 py-24 text-center dark:border-clinical-white/10">
        <Ruler size={48} className="mx-auto text-omega-dark/20 dark:text-clinical-white/15" />
        <p className="mt-4 text-sm text-omega-dark/40 dark:text-clinical-white/30">
          Módulo de Mediciones — Próximamente
        </p>
      </div>
    </div>
  )
}
