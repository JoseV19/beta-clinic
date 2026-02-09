import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Info, Trash2, Loader2 } from 'lucide-react'

type Variant = 'danger' | 'warning' | 'info'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Variant
  loading?: boolean
}

const variantConfig: Record<Variant, { icon: typeof Trash2; btnCls: string; iconCls: string }> = {
  danger: {
    icon: Trash2,
    btnCls: 'bg-red-600 hover:bg-red-700 text-white',
    iconCls: 'text-red-400 bg-red-400/10',
  },
  warning: {
    icon: AlertTriangle,
    btnCls: 'bg-amber-600 hover:bg-amber-700 text-white',
    iconCls: 'text-amber-400 bg-amber-400/10',
  },
  info: {
    icon: Info,
    btnCls: 'bg-omega-violet hover:bg-omega-violet/80 text-white',
    iconCls: 'text-omega-violet bg-omega-violet/10',
  },
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant]
  const Icon = cfg.icon

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-clinical-white/10 bg-omega-surface p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
          >
            <div className="flex gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.iconCls}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-clinical-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-clinical-white/60">{message}</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={onCancel}
                disabled={loading}
                className="rounded-lg border border-clinical-white/10 px-4 py-2 text-xs font-medium text-clinical-white/60 transition-colors hover:bg-clinical-white/5 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${cfg.btnCls}`}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
