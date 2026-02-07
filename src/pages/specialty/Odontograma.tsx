import { useMemo } from 'react'
import { ClipboardList, Trash2, DollarSign } from 'lucide-react'
import Odontogram, {
  TOOL_COLORS,
  TOOL_LABELS,
  type OdontogramData,
  type Tool,
} from '../../components/dental/Odontogram'
import { usePersistentState } from '../../hooks/usePersistentState'

/* ── Treatment plan item derived from odontogram data ──── */

interface TreatmentItem {
  key: string
  tooth: number
  treatment: Tool
  detail: string
}

const SURFACE_NAMES: Record<string, string> = {
  vestibular: 'Vestibular',
  lingual: 'Lingual',
  mesial: 'Mesial',
  distal: 'Distal',
  oclusal: 'Oclusal',
}

function deriveTreatmentPlan(data: OdontogramData): TreatmentItem[] {
  const items: TreatmentItem[] = []

  const sortedTeeth = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b)

  for (const tooth of sortedTeeth) {
    const td = data[tooth]
    if (!td) continue

    // Whole-tooth statuses
    if (td.status) {
      items.push({
        key: `${tooth}-status`,
        tooth,
        treatment: td.status,
        detail: TOOL_LABELS[td.status],
      })
    }

    // Surface-level treatments
    for (const [surface, tool] of Object.entries(td.surfaces)) {
      items.push({
        key: `${tooth}-${surface}`,
        tooth,
        treatment: tool,
        detail: `${TOOL_LABELS[tool]} — ${SURFACE_NAMES[surface] ?? surface}`,
      })
    }
  }

  return items
}

/* ── Component ────────────────────────────────────────── */

export default function Odontograma() {
  const [data, setData, resetData] = usePersistentState<OdontogramData>('beta_odontogram', {})

  const treatmentPlan = useMemo(() => deriveTreatmentPlan(data), [data])

  function removeItem(item: TreatmentItem) {
    setData((prev) => {
      const tooth = prev[item.tooth]
      if (!tooth) return prev

      // Remove whole-tooth status
      if (item.key.endsWith('-status')) {
        return { ...prev, [item.tooth]: { ...tooth, status: undefined } }
      }

      // Remove surface treatment
      const surface = item.key.split('-')[1]
      const newSurfaces = { ...tooth.surfaces }
      delete newSurfaces[surface as keyof typeof newSurfaces]

      // Clean up empty tooth entries
      const updated = { ...tooth, surfaces: newSurfaces }
      if (Object.keys(updated.surfaces).length === 0 && !updated.status) {
        const next = { ...prev }
        delete next[item.tooth]
        return next
      }

      return { ...prev, [item.tooth]: updated }
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Odontograma</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Registro visual del estado dental y plan de tratamiento
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left: Odontogram */}
        <div className="min-w-0 flex-1">
          <Odontogram data={data} onChange={setData} onReset={resetData} />
        </div>

        {/* Right: Treatment Plan */}
        <div className="w-full shrink-0 xl:w-80">
          <div className="sticky top-6 rounded-xl border border-omega-violet/20 bg-white dark:border-clinical-white/10 dark:bg-omega-surface">
            {/* Plan header */}
            <div className="flex items-center gap-2 border-b border-omega-violet/10 px-4 py-3 dark:border-clinical-white/5">
              <ClipboardList size={16} className="text-beta-mint" />
              <h2 className="text-sm font-bold text-omega-dark dark:text-clinical-white">
                Plan de Tratamiento
              </h2>
              {treatmentPlan.length > 0 && (
                <span className="ml-auto rounded-full bg-beta-mint/15 px-2 py-0.5 text-[10px] font-bold text-beta-mint">
                  {treatmentPlan.length}
                </span>
              )}
            </div>

            {/* Items */}
            {treatmentPlan.length > 0 ? (
              <div className="max-h-[60vh] divide-y divide-omega-violet/5 overflow-y-auto dark:divide-clinical-white/5">
                {treatmentPlan.map((item) => (
                  <div
                    key={item.key}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-omega-violet/[0.03] dark:hover:bg-clinical-white/[0.03]"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm border border-black/20"
                      style={{ backgroundColor: TOOL_COLORS[item.treatment] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-omega-dark dark:text-clinical-white">
                        Diente {item.tooth}
                      </p>
                      <p className="truncate text-xs text-omega-dark/50 dark:text-clinical-white/40">
                        {item.detail}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      className="rounded-lg p-1.5 text-omega-dark/20 opacity-0 transition-all hover:bg-alert-red/10 hover:text-alert-red group-hover:opacity-100 dark:text-clinical-white/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <ClipboardList size={28} className="mx-auto text-omega-dark/15 dark:text-clinical-white/10" />
                <p className="mt-2 text-xs text-omega-dark/40 dark:text-clinical-white/30">
                  Marca tratamientos en el odontograma para generar el plan
                </p>
              </div>
            )}

            {/* Footer totals */}
            {treatmentPlan.length > 0 && (
              <div className="border-t border-omega-violet/10 px-4 py-3 dark:border-clinical-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-omega-dark/50 dark:text-clinical-white/40">
                    Total Estimado
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-beta-mint">
                    <DollarSign size={14} />
                    0.00
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-omega-dark/30 dark:text-clinical-white/20">
                  Asigne precios en Presupuestos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
