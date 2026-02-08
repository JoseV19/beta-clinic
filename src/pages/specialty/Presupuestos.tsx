import DentalBudgetBuilder from '../../components/dental/DentalBudgetBuilder'

export default function Presupuestos() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">Presupuestos</h1>
        <p className="mt-0.5 text-sm text-omega-dark/50 dark:text-clinical-white/40">
          Cotizaciones y presupuestos de tratamientos dentales
        </p>
      </div>
      <DentalBudgetBuilder />
    </div>
  )
}
