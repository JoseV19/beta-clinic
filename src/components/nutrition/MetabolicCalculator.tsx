import { useState, useMemo, useEffect } from 'react'
import { Calculator, Flame, Zap, Scale } from 'lucide-react'

/* ── Types ─────────────────────────────────────────────── */

type Gender = 'male' | 'female'
type Activity = 'sedentary' | 'light' | 'moderate' | 'intense'

interface Inputs {
  weight: string
  height: string
  age: string
  gender: Gender
  activity: Activity
}

/* ── Constants ─────────────────────────────────────────── */

const ACTIVITY_FACTORS: Record<Activity, { label: string; factor: number }> = {
  sedentary: { label: 'Sedentario', factor: 1.2 },
  light:     { label: 'Ligero', factor: 1.375 },
  moderate:  { label: 'Moderado', factor: 1.55 },
  intense:   { label: 'Intenso', factor: 1.725 },
}

const BMI_RANGES: { max: number; label: string; color: string; bg: string }[] = [
  { max: 18.5, label: 'Bajo peso',  color: 'text-amber-400',    bg: 'bg-amber-400/15 border-amber-400/30' },
  { max: 24.9, label: 'Normal',     color: 'text-emerald-400',  bg: 'bg-emerald-400/15 border-emerald-400/30' },
  { max: 29.9, label: 'Sobrepeso',  color: 'text-orange-400',   bg: 'bg-orange-400/15 border-orange-400/30' },
  { max: Infinity, label: 'Obesidad', color: 'text-alert-red',  bg: 'bg-alert-red/15 border-alert-red/30' },
]

function classifyBmi(bmi: number) {
  return BMI_RANGES.find(r => bmi <= r.max) ?? BMI_RANGES[3]
}

/* ── Shared styles ─────────────────────────────────────── */

const inputBase =
  'w-full rounded-lg border border-omega-violet/20 bg-clinical-white px-3 py-2.5 text-sm text-omega-dark outline-none transition-colors focus:border-beta-mint/50 focus:ring-2 focus:ring-beta-mint/10 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white'

const glassCard =
  'relative overflow-hidden rounded-2xl border border-beta-mint/20 bg-white/80 p-5 backdrop-blur-sm dark:border-beta-mint/10 dark:bg-omega-surface/80'

/* ── Exported result type ───────────────────────────────── */

export interface MetabolicResults {
  weight: number
  bmi: number
  tmb: number
  get: number
}

/* ── Component ─────────────────────────────────────────── */

export default function MetabolicCalculator({ onResults }: { onResults?: (r: MetabolicResults | null) => void }) {
  const [inputs, setInputs] = useState<Inputs>({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activity: 'moderate',
  })

  function update<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  /* ── Calculations ──────────────────────────────────── */

  const results = useMemo(() => {
    const w = parseFloat(inputs.weight)
    const h = parseFloat(inputs.height)
    const a = parseFloat(inputs.age)

    if (!w || !h || !a || w <= 0 || h <= 0 || a <= 0) return null

    // BMI
    const heightM = h / 100
    const bmi = w / (heightM * heightM)

    // Harris-Benedict TMB
    const tmb =
      inputs.gender === 'male'
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.330 * a

    // GET
    const factor = ACTIVITY_FACTORS[inputs.activity].factor
    const get = tmb * factor

    return { weight: w, bmi, tmb, get }
  }, [inputs])

  useEffect(() => {
    onResults?.(results)
  }, [results, onResults])

  const bmiClass = results ? classifyBmi(results.bmi) : null

  /* ── Render ────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* ── Input form ──────────────────────────────── */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-omega-dark dark:text-clinical-white">
          <Calculator size={18} className="text-omega-violet dark:text-beta-mint" />
          Datos del Paciente
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Weight */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Peso (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej. 70"
              value={inputs.weight}
              onChange={e => update('weight', e.target.value)}
              className={inputBase}
            />
          </div>

          {/* Height */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Altura (cm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej. 170"
              value={inputs.height}
              onChange={e => update('height', e.target.value)}
              className={inputBase}
            />
          </div>

          {/* Age */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Edad (años)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Ej. 30"
              value={inputs.age}
              onChange={e => update('age', e.target.value)}
              className={inputBase}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Género
            </label>
            <div className="flex gap-2">
              {([['male', 'Masculino'], ['female', 'Femenino']] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => update('gender', val)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    inputs.gender === val
                      ? 'border-beta-mint/40 bg-beta-mint/10 text-beta-mint'
                      : 'border-omega-violet/15 text-omega-dark/60 hover:border-beta-mint/30 dark:border-clinical-white/10 dark:text-clinical-white/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="mb-1 block text-xs font-medium text-omega-dark/60 dark:text-clinical-white/40">
              Nivel de Actividad
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(ACTIVITY_FACTORS) as [Activity, { label: string; factor: number }][]).map(
                ([key, { label }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => update('activity', key)}
                    className={`rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      inputs.activity === key
                        ? 'border-beta-mint/40 bg-beta-mint/10 text-beta-mint'
                        : 'border-omega-violet/15 text-omega-dark/60 hover:border-beta-mint/30 dark:border-clinical-white/10 dark:text-clinical-white/50'
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────── */}
      {results ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {/* IMC */}
          <div className={glassCard}>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-beta-mint/5 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-beta-mint/15">
                  <Scale size={18} className="text-beta-mint" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                  IMC
                </span>
              </div>
              <p className="text-4xl font-black tabular-nums text-omega-dark dark:text-clinical-white">
                {results.bmi.toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-omega-dark/50 dark:text-clinical-white/40">
                kg/m²
              </p>
              {bmiClass && (
                <span
                  className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${bmiClass.bg} ${bmiClass.color}`}
                >
                  {bmiClass.label}
                </span>
              )}
            </div>
          </div>

          {/* TMB */}
          <div className={glassCard}>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-400/5 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/15">
                  <Flame size={18} className="text-orange-400" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                  TMB
                </span>
              </div>
              <p className="text-4xl font-black tabular-nums text-omega-dark dark:text-clinical-white">
                {Math.round(results.tmb).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-omega-dark/50 dark:text-clinical-white/40">
                kcal/día
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-omega-dark/40 dark:text-clinical-white/30">
                Tasa Metabólica Basal
                <br />
                Harris-Benedict
              </p>
            </div>
          </div>

          {/* GET */}
          <div className={glassCard}>
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-beta-mint/5 blur-2xl" />
            <div className="relative">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-beta-mint/15">
                  <Zap size={18} className="text-beta-mint" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                  GET
                </span>
              </div>
              <p className="text-4xl font-black tabular-nums text-omega-dark dark:text-clinical-white">
                {Math.round(results.get).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-omega-dark/50 dark:text-clinical-white/40">
                kcal/día
              </p>
              <p className="mt-3 text-[11px] leading-relaxed text-omega-dark/40 dark:text-clinical-white/30">
                Gasto Energético Total
                <br />
                Factor: {ACTIVITY_FACTORS[inputs.activity].label} (&times;{ACTIVITY_FACTORS[inputs.activity].factor})
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-omega-violet/20 py-16 text-center dark:border-clinical-white/10">
          <Calculator size={40} className="mx-auto text-omega-dark/15 dark:text-clinical-white/10" />
          <p className="mt-3 text-sm text-omega-dark/40 dark:text-clinical-white/30">
            Ingresa los datos del paciente para calcular los indicadores
          </p>
        </div>
      )}

      {/* ── Reference table ─────────────────────────── */}
      {results && (
        <div className="rounded-xl border border-omega-violet/20 bg-white p-5 dark:border-clinical-white/10 dark:bg-omega-surface">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            Clasificación IMC (OMS)
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {BMI_RANGES.map(r => (
              <div
                key={r.label}
                className={`rounded-lg border px-3 py-2 text-center text-xs font-medium transition-colors ${
                  bmiClass?.label === r.label
                    ? `${r.bg} ${r.color}`
                    : 'border-omega-violet/10 text-omega-dark/40 dark:border-clinical-white/10 dark:text-clinical-white/30'
                }`}
              >
                <p className="font-bold">{r.label}</p>
                <p className="mt-0.5 opacity-70">
                  {r.max === 18.5 && '< 18.5'}
                  {r.max === 24.9 && '18.5 – 24.9'}
                  {r.max === 29.9 && '25.0 – 29.9'}
                  {r.max === Infinity && '≥ 30.0'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
