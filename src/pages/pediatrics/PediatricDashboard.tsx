import { useLocation, useNavigate } from 'react-router-dom'
import { TrendingUp, Syringe, Check } from 'lucide-react'
import GrowthChart from '../../components/pediatrics/GrowthChart'
import { usePersistentState } from '../../hooks/usePersistentState'

/* ── Vaccination schedule (Colombia PAI) ───────────── */

const VACCINATION_SCHEDULE = [
  {
    age: 'Recién nacido',
    vaccines: [
      { id: 'bcg', name: 'BCG (Tuberculosis)' },
      { id: 'hepb_0', name: 'Hepatitis B (dosis neonatal)' },
    ],
  },
  {
    age: '2 meses',
    vaccines: [
      { id: 'penta_1', name: 'Pentavalente (1ra dosis)' },
      { id: 'polio_1', name: 'Polio oral (1ra dosis)' },
      { id: 'rota_1', name: 'Rotavirus (1ra dosis)' },
      { id: 'neumo_1', name: 'Neumococo conjugado (1ra dosis)' },
    ],
  },
  {
    age: '4 meses',
    vaccines: [
      { id: 'penta_2', name: 'Pentavalente (2da dosis)' },
      { id: 'polio_2', name: 'Polio oral (2da dosis)' },
      { id: 'rota_2', name: 'Rotavirus (2da dosis)' },
      { id: 'neumo_2', name: 'Neumococo conjugado (2da dosis)' },
    ],
  },
  {
    age: '6 meses',
    vaccines: [
      { id: 'penta_3', name: 'Pentavalente (3ra dosis)' },
      { id: 'polio_3', name: 'Polio oral (3ra dosis)' },
      { id: 'influ_1', name: 'Influenza (1ra dosis)' },
    ],
  },
  {
    age: '7 meses',
    vaccines: [
      { id: 'influ_2', name: 'Influenza (2da dosis)' },
    ],
  },
  {
    age: '12 meses',
    vaccines: [
      { id: 'srp_1', name: 'SRP — Triple viral (1ra dosis)' },
      { id: 'varicela', name: 'Varicela' },
      { id: 'neumo_r', name: 'Neumococo conjugado (refuerzo)' },
      { id: 'hepa', name: 'Hepatitis A' },
      { id: 'fa', name: 'Fiebre amarilla' },
    ],
  },
  {
    age: '18 meses',
    vaccines: [
      { id: 'dpt_r1', name: 'DPT (1er refuerzo)' },
      { id: 'polio_r1', name: 'Polio oral (1er refuerzo)' },
    ],
  },
  {
    age: '5 años',
    vaccines: [
      { id: 'dpt_r2', name: 'DPT (2do refuerzo)' },
      { id: 'polio_r2', name: 'Polio oral (2do refuerzo)' },
      { id: 'srp_2', name: 'SRP — Triple viral (2da dosis)' },
    ],
  },
]

const TOTAL_VACCINES = VACCINATION_SCHEDULE.reduce((n, g) => n + g.vaccines.length, 0)

/* ── Component ─────────────────────────────────────── */

type Tab = 'crecimiento' | 'vacunacion'

export default function PediatricDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab: Tab = location.pathname === '/vacunacion' ? 'vacunacion' : 'crecimiento'

  const [applied, setApplied] = usePersistentState<Record<string, boolean>>(
    'beta_vaccines',
    {},
  )

  const toggleVaccine = (id: string) =>
    setApplied(prev => ({ ...prev, [id]: !prev[id] }))

  const appliedCount = Object.values(applied).filter(Boolean).length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Pediatría
        </h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Seguimiento de crecimiento y esquema de vacunación
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-omega-dark/5 p-1 dark:bg-clinical-white/5">
        <button
          onClick={() => navigate('/crecimiento', { replace: true })}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'crecimiento'
              ? 'bg-white text-omega-dark shadow-sm dark:bg-omega-surface dark:text-clinical-white'
              : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
          }`}
        >
          <TrendingUp size={16} />
          Curvas de Crecimiento
        </button>
        <button
          onClick={() => navigate('/vacunacion', { replace: true })}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'vacunacion'
              ? 'bg-white text-omega-dark shadow-sm dark:bg-omega-surface dark:text-clinical-white'
              : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
          }`}
        >
          <Syringe size={16} />
          Esquema de Vacunación
        </button>
      </div>

      {/* ── Tab: Crecimiento ─────────────────────────── */}
      {tab === 'crecimiento' && (
        <div className="rounded-xl border border-omega-violet/20 bg-white p-6 dark:border-clinical-white/10 dark:bg-omega-surface">
          <GrowthChart />
        </div>
      )}

      {/* ── Tab: Vacunación ──────────────────────────── */}
      {tab === 'vacunacion' && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-omega-dark dark:text-clinical-white">
                Progreso de vacunación
              </span>
              <span className="text-beta-mint">
                {appliedCount} / {TOTAL_VACCINES} aplicadas
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-omega-dark/10 dark:bg-clinical-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-beta-mint to-beta-mint/70 transition-all duration-500"
                style={{ width: `${(appliedCount / TOTAL_VACCINES) * 100}%` }}
              />
            </div>
          </div>

          {/* Vaccination groups */}
          {VACCINATION_SCHEDULE.map(group => {
            const groupApplied = group.vaccines.filter(v => applied[v.id]).length
            const groupComplete = groupApplied === group.vaccines.length

            return (
              <div
                key={group.age}
                className={`rounded-xl border bg-white p-5 transition-colors dark:bg-omega-surface ${
                  groupComplete
                    ? 'border-beta-mint/30 dark:border-beta-mint/20'
                    : 'border-omega-violet/20 dark:border-clinical-white/10'
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-beta-mint">
                    {group.age}
                  </h3>
                  {groupComplete && (
                    <span className="flex items-center gap-1 rounded-full bg-beta-mint/15 px-2.5 py-0.5 text-[11px] font-semibold text-beta-mint">
                      <Check size={12} /> Completo
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {group.vaccines.map(v => (
                    <label
                      key={v.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-beta-mint/5"
                    >
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={!!applied[v.id]}
                          onChange={() => toggleVaccine(v.id)}
                          className="peer sr-only"
                        />
                        <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-omega-dark/20 transition-colors peer-checked:border-beta-mint peer-checked:bg-beta-mint dark:border-clinical-white/20">
                          {applied[v.id] && <Check size={14} className="text-omega-dark" />}
                        </div>
                      </div>
                      <span
                        className={`text-sm transition-colors ${
                          applied[v.id]
                            ? 'text-omega-dark/40 line-through dark:text-clinical-white/30'
                            : 'text-omega-dark dark:text-clinical-white'
                        }`}
                      >
                        {v.name}
                      </span>
                      {applied[v.id] && (
                        <span className="ml-auto text-[11px] font-medium text-beta-mint">
                          Aplicada
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
