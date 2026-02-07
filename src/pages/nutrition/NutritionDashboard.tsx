import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calculator, UtensilsCrossed } from 'lucide-react'
import MetabolicCalculator, { type MetabolicResults } from '../../components/nutrition/MetabolicCalculator'
import MealPlanner from '../../components/nutrition/MealPlanner'

type Tab = 'calculadora' | 'planificador'

export default function NutritionDashboard() {
  const location = useLocation()
  const navigate = useNavigate()
  const tab: Tab = location.pathname === '/planificador' ? 'planificador' : 'calculadora'

  const [results, setResults] = useState<MetabolicResults | null>(null)
  const handleResults = useCallback((r: MetabolicResults | null) => setResults(r), [])

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
          patientWeight={results?.weight}
          patientBmi={results?.bmi}
        />
      )}
    </div>
  )
}
