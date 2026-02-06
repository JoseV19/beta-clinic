import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  index: number
}

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export default function StatsCard({ title, value, icon: Icon, index }: StatsCardProps) {
  return (
    <motion.div
      variants={cardVariant}
      custom={index}
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-omega-surface to-omega-surface/80 p-5 backdrop-blur-sm transition-colors duration-200 hover:border-beta-mint/25 dark:from-omega-surface dark:to-omega-abyss/60"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-omega-dark/50 dark:text-clinical-white/40">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-beta-mint">{value}</p>
        </div>
        <div className="rounded-lg bg-omega-violet/10 p-2.5 dark:bg-omega-violet/20">
          <Icon size={22} className="text-beta-mint" strokeWidth={1.75} />
        </div>
      </div>
    </motion.div>
  )
}
