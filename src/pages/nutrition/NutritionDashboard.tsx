import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calculator, UtensilsCrossed, ChevronDown } from 'lucide-react'
import MetabolicCalculator, { type MetabolicResults } from '../../components/nutrition/MetabolicCalculator'
import MealPlanner from '../../components/nutrition/MealPlanner'
import { useData } from '../../context/DataContext'

type Tab = 'calculadora' | 'planificador'

export default function NutritionDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const { patients } = useData()
  const tab: Tab = location.pathname === '/planificador' ? 'planificador' : 'calculadora'

  const [selectedPatientId, setSelectedPatientId] = useState(0)
  const selectedPatient = patients.find(p => p.id === selectedPatientId)

  const [results, setResults] = useState<MetabolicResults | null>(null)
  const handleResults = useCallback((r: MetabolicResults | null) => setResults(r), [])

  const inputCls = 'w-full rounded-lg border border-clinical-white/10 bg-omega-abyss px-3 py-2 text-sm text-clinical-white outline-none placeholder:text-clinical-white/30 focus:border-beta-mint/30 focus:ring-2 focus:ring-beta-mint/10 appearance-none'

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Nutrición
        </h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Herramientas de cálculo metabólico y planificación alimentaria
        </p>
      </div>

      {/* Patient selector */}
      <div className="rounded-xl border border-omega-violet/20 bg-white p-4 dark:border-clinical-white/10 dark:bg-omega-surface">
        <label className="mb-1 block text-xs font-medium text-omega-dark/50 dark:text-clinical-white/50">
          Paciente
        </label>
        <div className="relative">
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(Number(e.target.value))}
            className={inputCls}
          >
            <option value={0}>Seleccionar paciente...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-clinical-white/30"
          />
        </div>
        {selectedPatient && (
          <p className="mt-2 text-xs text-omega-dark/40 dark:text-clinical-white/30">
            {selectedPatient.edad} · {selectedPatient.genero}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-omega-dark/5 p-1 dark:bg-clinical-white/5">
        <button
          onClick={() => navigate('/calculadora', { replace: true })}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'calculadora'
              ? 'bg-white text-omega-dark shadow-sm dark:bg-omega-surface dark:text-clinical-white'
              : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
          }`}
        >
          <Calculator size={16} />
          Calculadora IMC
        </button>
        <button
          onClick={() => navigate('/planificador', { replace: true })}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === 'planificador'
              ? 'bg-white text-omega-dark shadow-sm dark:bg-omega-surface dark:text-clinical-white'
              : 'text-omega-dark/50 hover:text-omega-dark dark:text-clinical-white/40 dark:hover:text-clinical-white'
          }`}
        >
          <UtensilsCrossed size={16} />
          Planificador de Dieta
        </button>
      </div>

      {/* Tab: Calculadora */}
      {tab === 'calculadora' && (
        <MetabolicCalculator onResults={handleResults} />
      )}

      {/* Tab: Planificador */}
      {tab === 'planificador' && (
        <MealPlanner
          patientId={selectedPatientId > 0 ? selectedPatientId : undefined}
          patientName={selectedPatient?.nombre}
          patientWeight={results?.weight}
          patientBmi={results?.bmi}
        />
      )}
    </div>
  )
}
