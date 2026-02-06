import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
}

export default function StatsCard({ title, value, icon: Icon }: StatsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-omega-violet/20 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-omega-violet/10 dark:border-clinical-white/10 dark:bg-omega-surface dark:hover:shadow-beta-mint/5">
      {/* Decorative glow line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-omega-violet via-beta-mint to-omega-violet" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-beta-mint">{value}</p>
        </div>
        <div className="rounded-lg bg-omega-violet/10 p-2.5 dark:bg-omega-violet/25">
          <Icon size={22} className="text-beta-mint" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  )
}
