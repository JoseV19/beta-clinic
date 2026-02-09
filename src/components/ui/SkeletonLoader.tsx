interface SkeletonProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-2xl border border-clinical-white/5 bg-omega-surface/50 p-5 ${className}`}>
      <div className="mb-3 h-4 w-2/5 rounded bg-clinical-white/10" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-clinical-white/8" />
        <div className="h-3 w-3/4 rounded bg-clinical-white/8" />
      </div>
      <div className="mt-4 h-8 w-1/3 rounded-lg bg-clinical-white/10" />
    </div>
  )
}

export function SkeletonRow({ className = '' }: SkeletonProps) {
  return (
    <div className={`flex animate-pulse items-center gap-3 rounded-lg px-3 py-3 ${className}`}>
      <div className="h-8 w-8 rounded-full bg-clinical-white/10" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/5 rounded bg-clinical-white/10" />
        <div className="h-2.5 w-1/3 rounded bg-clinical-white/8" />
      </div>
      <div className="h-6 w-16 rounded-md bg-clinical-white/10" />
    </div>
  )
}

interface SkeletonTableProps extends SkeletonProps {
  rows?: number
}

export function SkeletonTable({ rows = 5, className = '' }: SkeletonTableProps) {
  return (
    <div className={`animate-pulse space-y-1 ${className}`}>
      {/* Header */}
      <div className="flex gap-4 border-b border-clinical-white/5 px-3 py-2">
        {[40, 25, 20, 15].map((w, i) => (
          <div key={i} className="h-3 rounded bg-clinical-white/10" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-3 py-2.5">
          {[40, 25, 20, 15].map((w, j) => (
            <div key={j} className="h-3 rounded bg-clinical-white/8" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  )
}
