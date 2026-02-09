import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Trash2, DollarSign, Send } from 'lucide-react'
import { toast } from 'sonner'
import Odontogram, {
  TOOL_COLORS,
  TOOL_LABELS,
  type OdontogramData,
  type Tool,
} from '../../components/dental/Odontogram'
import { useData } from '../../context/DataContext'
import { usePersistentState } from '../../hooks/usePersistentState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

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

const DEFAULT_PRICES: Record<Tool, number> = {
  caries: 40,
  resina: 40,
  corona: 250,
  extraer: 30,
  ausente: 0,
}

function deriveTreatmentPlan(data: OdontogramData): TreatmentItem[] {
  const items: TreatmentItem[] = []

  const sortedTeeth = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b)

  for (const tooth of sortedTeeth) {
    const td = data[tooth]
    if (!td) continue

    if (td.status) {
      items.push({
        key: `${tooth}-status`,
        tooth,
        treatment: td.status,
        detail: TOOL_LABELS[td.status],
      })
    }

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
  const { patients } = useData()
  const navigate = useNavigate()

  const [selectedPatientId, setSelectedPatientId] = useState(0)
  const [confirmReset, setConfirmReset] = useState(false)
  const [prices] = usePersistentState<Record<Tool, number>>('beta_dental_prices', DEFAULT_PRICES)

  // Per-patient odontogram data
  const lsKey = selectedPatientId > 0 ? `beta_odontogram_${selectedPatientId}` : 'beta_odontogram'
  const [data, setData, resetData] = usePersistentState<OdontogramData>(lsKey, {})

  const treatmentPlan = useMemo(() => deriveTreatmentPlan(data), [data])
  const totalEstimado = useMemo(
    () => treatmentPlan.reduce((sum, item) => sum + (prices[item.treatment] ?? 0), 0),
    [treatmentPlan, prices],
  )

  function removeItem(item: TreatmentItem) {
    setData((prev) => {
      const tooth = prev[item.tooth]
      if (!tooth) return prev

      if (item.key.endsWith('-status')) {
        return { ...prev, [item.tooth]: { ...tooth, status: undefined } }
      }

      const surface = item.key.split('-')[1]
      const newSurfaces = { ...tooth.surfaces }
      delete newSurfaces[surface as keyof typeof newSurfaces]

      const updated = { ...tooth, surfaces: newSurfaces }
      if (Object.keys(updated.surfaces).length === 0 && !updated.status) {
        const next = { ...prev }
        delete next[item.tooth]
        return next
      }

      return { ...prev, [item.tooth]: updated }
    })
  }

  function handleCreateBudget() {
    if (treatmentPlan.length === 0) {
      toast.error('Marca tratamientos en el odontograma primero')
      return
    }
    const patient = patients.find(p => p.id === selectedPatientId)
    const pending = {
      patientId: selectedPatientId,
      patientName: patient?.nombre ?? 'Sin paciente',
      items: treatmentPlan.map(item => ({
        treatment: TOOL_LABELS[item.treatment],
        tooth: `#${item.tooth}`,
        unitPrice: prices[item.treatment] ?? 0,
      })),
    }
    localStorage.setItem('beta_pending_budget', JSON.stringify(pending))
    toast.success('Items enviados al presupuesto')
    navigate('/presupuestos')
  }

  const inputCls = 'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-clinical-white">Odontograma</h1>
        <p className="mt-0.5 text-sm text-clinical-white/40">
          Registro visual del estado dental y plan de tratamiento
        </p>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl border border-clinical-white/10 bg-omega-surface p-4">
        <label className="mb-1 block text-xs font-medium text-clinical-white/50">Paciente</label>
        <select
          value={selectedPatientId}
          onChange={e => setSelectedPatientId(Number(e.target.value))}
          className={inputCls}
        >
          <option value={0}>Odontograma general (sin paciente)...</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.nombre}</option>
          ))}
        </select>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Left: Odontogram */}
        <div className="min-w-0 flex-1">
          <Odontogram data={data} onChange={setData} onReset={() => setConfirmReset(true)} />
        </div>

        {/* Right: Treatment Plan */}
        <div className="w-full shrink-0 xl:w-80">
          <div className="sticky top-6 rounded-xl border border-clinical-white/10 bg-omega-surface">
            {/* Plan header */}
            <div className="flex items-center gap-2 border-b border-clinical-white/5 px-4 py-3">
              <ClipboardList size={16} className="text-beta-mint" />
              <h2 className="text-sm font-bold text-clinical-white">
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
              <div className="max-h-[60vh] divide-y divide-clinical-white/5 overflow-y-auto">
                {treatmentPlan.map((item) => (
                  <div
                    key={item.key}
                    className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-clinical-white/[0.03]"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm border border-black/20"
                      style={{ backgroundColor: TOOL_COLORS[item.treatment] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-clinical-white">
                        Diente {item.tooth}
                      </p>
                      <p className="truncate text-xs text-clinical-white/40">
                        {item.detail}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-clinical-white/30">
                      ${prices[item.treatment] ?? 0}
                    </span>
                    <button
                      onClick={() => removeItem(item)}
                      className="rounded-lg p-1.5 text-clinical-white/20 opacity-0 transition-all hover:bg-red-400/10 hover:text-red-400 group-hover:opacity-100"
                      aria-label="Eliminar tratamiento"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center">
                <ClipboardList size={28} className="mx-auto text-clinical-white/10" />
                <p className="mt-2 text-xs text-clinical-white/30">
                  Marca tratamientos en el odontograma para generar el plan
                </p>
              </div>
            )}

            {/* Footer totals */}
            {treatmentPlan.length > 0 && (
              <div className="border-t border-clinical-white/5 px-4 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-clinical-white/40">
                    Total Estimado
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-beta-mint">
                    <DollarSign size={14} />
                    {totalEstimado.toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleCreateBudget}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-omega-violet py-2.5 text-xs font-semibold text-white transition-colors hover:bg-omega-violet/80"
                >
                  <Send size={14} />
                  Crear Presupuesto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Limpiar odontograma"
        message="¿Deseas eliminar todas las marcas del odontograma? Esta acción no se puede deshacer."
        confirmLabel="Limpiar"
        variant="danger"
        onConfirm={() => { resetData(); setConfirmReset(false) }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
