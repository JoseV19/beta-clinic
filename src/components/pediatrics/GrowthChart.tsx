import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from 'recharts'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  weightForAgeBoys,
  lengthHeightForAgeBoys,
  type GrowthDataPoint,
} from '../../data/whoGrowthStandards'
import { useTheme } from '../../context/ThemeContext'
import { useClinic } from '../../context/ClinicContext'
import { THEME_CONFIG } from '../../data/themeConfig'
import { usePersistentState } from '../../hooks/usePersistentState'

/* ── Types ─────────────────────────────────────────── */

type ChartType = 'weight' | 'height'

interface BandedPoint {
  month: number
  base: number
  severe_low: number
  mild_low: number
  normal_high: number
  mild_high: number
  median: number
  sd3neg: number
  sd2neg: number
  sd2pos: number
  sd3pos: number
  patientValue?: number | null
}

export interface Measurement {
  date: string
  ageMonths: number
  weightKg: number
  heightCm: number
}

/* ── Props ────────────────────────────────────────── */

interface GrowthChartProps {
  patientId?: number
  patientBirthDate?: string
}

/* ── Config ────────────────────────────────────────── */

const CHARTS: Record<ChartType, { title: string; yLabel: string; data: GrowthDataPoint[] }> = {
  weight: {
    title: 'Peso para la Edad — Niños 0-5 años (OMS)',
    yLabel: 'Peso (kg)',
    data: weightForAgeBoys,
  },
  height: {
    title: 'Talla para la Edad — Niños 0-5 años (OMS)',
    yLabel: 'Talla (cm)',
    data: lengthHeightForAgeBoys,
  },
}

/* ── Helpers ───────────────────────────────────────── */

function toBanded(raw: GrowthDataPoint[]): BandedPoint[] {
  return raw.map(d => ({
    month: d.month,
    base: d.sd3neg,
    severe_low: d.sd2neg - d.sd3neg,
    mild_low: d.median - d.sd2neg,
    normal_high: d.sd2pos - d.median,
    mild_high: d.sd3pos - d.sd2pos,
    median: d.median,
    sd3neg: d.sd3neg,
    sd2neg: d.sd2neg,
    sd2pos: d.sd2pos,
    sd3pos: d.sd3pos,
    patientValue: null,
  }))
}

function computeAgeMonths(birthDate: string, measureDate: string): number {
  const b = new Date(birthDate)
  const m = new Date(measureDate)
  return (m.getFullYear() - b.getFullYear()) * 12 + (m.getMonth() - b.getMonth())
}

/* ── Custom Tooltip ────────────────────────────────── */

function ChartTooltip(props: Partial<TooltipContentProps<number, string>>) {
  const { active, payload, label } = props
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as BandedPoint | undefined
  if (!d) return null

  return (
    <div className="rounded-lg border border-clinical-white/10 bg-omega-dark px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-beta-mint">Mes {label}</p>
      <p className="text-clinical-white/60">+3 DE: {d.sd3pos}</p>
      <p className="text-clinical-white/60">+2 DE: {d.sd2pos}</p>
      <p className="font-medium text-clinical-white">Mediana: {d.median}</p>
      <p className="text-clinical-white/60">-2 DE: {d.sd2neg}</p>
      <p className="text-clinical-white/60">-3 DE: {d.sd3neg}</p>
      {d.patientValue != null && (
        <p className="mt-1 font-bold text-omega-violet">Paciente: {d.patientValue}</p>
      )}
    </div>
  )
}

/* ── Component ─────────────────────────────────────── */

export default function GrowthChart({ patientId, patientBirthDate }: GrowthChartProps) {
  const [chartType, setChartType] = useState<ChartType>('weight')
  const { theme } = useTheme()
  const { clinicType } = useClinic()
  const config = CHARTS[chartType]
  const accent = THEME_CONFIG[clinicType ?? 'general'].accent

  const storageKey = patientId && patientId > 0
    ? `beta_growth_${patientId}`
    : 'beta_growth'

  const [measurements, setMeasurements] = usePersistentState<Measurement[]>(storageKey, [])

  /* ── Measurement form state ──────────────────────── */
  const [showForm, setShowForm] = useState(false)
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
  const [formAge, setFormAge] = useState('')
  const [formWeight, setFormWeight] = useState('')
  const [formHeight, setFormHeight] = useState('')

  function addMeasurement() {
    const weight = parseFloat(formWeight)
    const height = parseFloat(formHeight)
    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      toast.error('Ingresa peso y talla válidos')
      return
    }

    let ageMonths: number
    if (patientBirthDate) {
      ageMonths = computeAgeMonths(patientBirthDate, formDate)
    } else if (formAge) {
      ageMonths = parseInt(formAge, 10)
    } else {
      toast.error('Ingresa la edad en meses')
      return
    }

    if (ageMonths < 0 || ageMonths > 60) {
      toast.error('La edad debe estar entre 0 y 60 meses')
      return
    }

    setMeasurements(prev => [...prev, { date: formDate, ageMonths, weightKg: weight, heightCm: height }])
    setFormWeight('')
    setFormHeight('')
    setFormAge('')
    setShowForm(false)
    toast.success('Medición registrada')
  }

  function removeMeasurement(index: number) {
    setMeasurements(prev => prev.filter((_, i) => i !== index))
  }

  /* ── Merge WHO data with patient measurements ────── */
  const data = useMemo(() => {
    const banded = toBanded(config.data)
    const measureKey = chartType === 'weight' ? 'weightKg' : 'heightCm'

    // Build a map of month → patient value
    const patientMap = new Map<number, number>()
    for (const m of measurements) {
      patientMap.set(m.ageMonths, m[measureKey])
    }

    return banded.map(point => ({
      ...point,
      patientValue: patientMap.get(point.month) ?? null,
    }))
  }, [config.data, measurements, chartType])

  const tick = theme === 'dark' ? 'rgba(248,249,250,0.45)' : 'rgba(0,0,0,0.45)'
  const grid = theme === 'dark' ? 'rgba(127,255,212,0.07)' : 'rgba(0,0,0,0.06)'
  const labelFill = theme === 'dark' ? 'rgba(248,249,250,0.55)' : 'rgba(0,0,0,0.55)'

  const inputCls = 'w-full rounded-lg border border-omega-violet/20 bg-white px-3 py-2 text-sm text-omega-dark outline-none focus:border-beta-mint/40 dark:border-clinical-white/10 dark:bg-omega-abyss dark:text-clinical-white'

  return (
    <div className="space-y-4">
      {/* Chart type selector + Add measurement button */}
      <div className="flex flex-wrap items-center gap-2">
        {(['weight', 'height'] as const).map(t => (
          <button
            key={t}
            onClick={() => setChartType(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              chartType === t
                ? 'bg-beta-mint/15 text-beta-mint'
                : 'text-omega-dark/60 hover:bg-omega-dark/5 dark:text-clinical-white/50 dark:hover:bg-clinical-white/5'
            }`}
          >
            {t === 'weight' ? 'Peso / Edad' : 'Talla / Edad'}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-lg bg-beta-mint/15 px-3 py-2 text-xs font-semibold text-beta-mint transition-colors hover:bg-beta-mint/25"
        >
          <Plus size={14} />
          Agregar Medición
        </button>
      </div>

      {/* Measurement form */}
      {showForm && (
        <div className="rounded-xl border border-beta-mint/20 bg-beta-mint/5 p-4 dark:bg-beta-mint/[0.03]">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-36">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                Fecha
              </label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className={inputCls}
              />
            </div>
            {!patientBirthDate && (
              <div className="w-28">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                  Edad (meses)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={formAge}
                  onChange={e => setFormAge(e.target.value)}
                  placeholder="0-60"
                  className={inputCls}
                />
              </div>
            )}
            <div className="w-28">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                Peso (kg)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={formWeight}
                onChange={e => setFormWeight(e.target.value)}
                placeholder="3.5"
                className={inputCls}
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
                Talla (cm)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={formHeight}
                onChange={e => setFormHeight(e.target.value)}
                placeholder="50"
                className={inputCls}
              />
            </div>
            <button
              onClick={addMeasurement}
              className="rounded-lg bg-beta-mint px-4 py-2 text-sm font-bold text-omega-dark transition-transform hover:scale-105 active:scale-95"
            >
              Registrar
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg px-3 py-2 text-sm text-omega-dark/50 transition-colors hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white"
            >
              Cancelar
            </button>
          </div>
          {patientBirthDate && (
            <p className="mt-2 text-[10px] text-omega-dark/40 dark:text-clinical-white/30">
              La edad se calcula automáticamente desde la fecha de nacimiento ({new Date(patientBirthDate).toLocaleDateString('es-GT')})
            </p>
          )}
        </div>
      )}

      {/* Measurements list */}
      {measurements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {measurements
            .slice()
            .sort((a, b) => a.ageMonths - b.ageMonths)
            .map((m, i) => (
              <div
                key={`${m.date}-${m.ageMonths}`}
                className="group flex items-center gap-2 rounded-lg border border-omega-violet/15 bg-omega-violet/5 px-3 py-1.5 text-xs dark:border-clinical-white/10 dark:bg-clinical-white/5"
              >
                <span className="font-semibold text-omega-dark dark:text-clinical-white">
                  {m.ageMonths}m
                </span>
                <span className="text-omega-dark/50 dark:text-clinical-white/40">
                  {m.weightKg}kg · {m.heightCm}cm
                </span>
                <span className="text-omega-dark/30 dark:text-clinical-white/20">
                  {new Date(m.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short' })}
                </span>
                <button
                  onClick={() => removeMeasurement(i)}
                  className="rounded p-0.5 text-omega-dark/20 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100 dark:text-clinical-white/15"
                  aria-label="Eliminar medición"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Title */}
      <h3 className="text-base font-semibold text-omega-dark dark:text-clinical-white">
        {config.title}
      </h3>

      {/* Chart */}
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: tick }}
              label={{
                value: 'Edad (meses)',
                position: 'insideBottom',
                offset: -15,
                style: { fontSize: 12, fill: labelFill },
              }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: tick }}
              label={{
                value: config.yLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                style: { fontSize: 12, fill: labelFill },
              }}
            />
            <Tooltip content={<ChartTooltip />} />

            {/* Z-score bands (stacked areas) */}
            <Area type="monotone" dataKey="base" stackId="b" fill="transparent" stroke="none" isAnimationActive={false} />
            <Area type="monotone" dataKey="severe_low" stackId="b" fill="rgba(229,57,53,0.15)" stroke="none" isAnimationActive={false} />
            <Area type="monotone" dataKey="mild_low" stackId="b" fill="rgba(255,152,0,0.12)" stroke="none" isAnimationActive={false} />
            <Area type="monotone" dataKey="normal_high" stackId="b" fill="rgba(127,255,212,0.12)" stroke="none" isAnimationActive={false} />
            <Area type="monotone" dataKey="mild_high" stackId="b" fill="rgba(255,152,0,0.12)" stroke="none" isAnimationActive={false} />

            {/* Z-score lines */}
            <Line type="monotone" dataKey="sd3neg" stroke="#E53935" strokeWidth={1} strokeDasharray="5 3" dot={false} name="-3 DE" />
            <Line type="monotone" dataKey="sd2neg" stroke="#FF9800" strokeWidth={1} strokeDasharray="5 3" dot={false} name="-2 DE" />
            <Line type="monotone" dataKey="median" stroke={accent} strokeWidth={2.5} dot={false} name="Mediana" />
            <Line type="monotone" dataKey="sd2pos" stroke="#FF9800" strokeWidth={1} strokeDasharray="5 3" dot={false} name="+2 DE" />
            <Line type="monotone" dataKey="sd3pos" stroke="#E53935" strokeWidth={1} strokeDasharray="5 3" dot={false} name="+3 DE" />

            {/* Patient measurements overlay */}
            {measurements.length > 0 && (
              <Scatter
                dataKey="patientValue"
                fill="#7C3AED"
                stroke="#7C3AED"
                name="Paciente"
                shape={(props: { cx?: number; cy?: number; payload?: BandedPoint }) => {
                  if (props.payload?.patientValue == null) return <g />
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill="#7C3AED"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-omega-dark/60 dark:text-clinical-white/50">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[3px] w-5 rounded-full bg-beta-mint" /> Mediana
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-5 border-t-2 border-dashed border-[#FF9800]" /> &plusmn;2 DE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-5 border-t-2 border-dashed border-[#E53935]" /> &plusmn;3 DE
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm bg-beta-mint/20" /> Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm bg-[rgba(255,152,0,0.2)]" /> Alerta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-5 rounded-sm bg-[rgba(229,57,53,0.2)]" /> Riesgo
        </span>
        {measurements.length > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full bg-omega-violet" /> Paciente
          </span>
        )}
      </div>
    </div>
  )
}
