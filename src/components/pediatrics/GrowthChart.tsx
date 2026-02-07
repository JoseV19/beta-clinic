import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from 'recharts'
import {
  weightForAgeBoys,
  lengthHeightForAgeBoys,
  type GrowthDataPoint,
} from '../../data/whoGrowthStandards'
import { useTheme } from '../../context/ThemeContext'
import { useClinic } from '../../context/ClinicContext'
import { THEME_CONFIG } from '../../data/themeConfig'

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
  }))
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
    </div>
  )
}

/* ── Component ─────────────────────────────────────── */

export default function GrowthChart() {
  const [chartType, setChartType] = useState<ChartType>('weight')
  const { theme } = useTheme()
  const { clinicType } = useClinic()
  const config = CHARTS[chartType]
  const data = useMemo(() => toBanded(config.data), [config.data])
  const accent = THEME_CONFIG[clinicType ?? 'general'].accent

  const tick = theme === 'dark' ? 'rgba(248,249,250,0.45)' : 'rgba(0,0,0,0.45)'
  const grid = theme === 'dark' ? 'rgba(127,255,212,0.07)' : 'rgba(0,0,0,0.06)'
  const labelFill = theme === 'dark' ? 'rgba(248,249,250,0.55)' : 'rgba(0,0,0,0.55)'

  return (
    <div className="space-y-4">
      {/* Chart type selector */}
      <div className="flex gap-2">
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
      </div>

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
      </div>
    </div>
  )
}
