import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface ErrorFallbackProps {
  error: Error | null
  onRetry: () => void
}

export default function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-omega-dark dark:text-clinical-white">
          Algo salió mal
        </h2>
        <p className="mt-2 text-sm text-omega-dark/60 dark:text-clinical-white/50">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al dashboard.
        </p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-omega-violet px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-omega-violet/80"
          >
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-clinical-white/10 bg-omega-surface/50 px-5 py-2.5 text-sm font-semibold text-clinical-white transition-colors hover:bg-omega-surface"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </a>
        </div>

        {/* Error details (collapsible) */}
        {error && (
          <div className="mt-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-clinical-white/30 underline transition-colors hover:text-clinical-white/50"
            >
              {showDetails ? 'Ocultar detalles' : 'Ver detalles del error'}
            </button>
            {showDetails && (
              <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-omega-abyss/80 p-4 text-left text-xs text-red-300">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
