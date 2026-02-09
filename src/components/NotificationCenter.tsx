import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  CalendarClock,
  DollarSign,
  Stethoscope,
  Trash2,
} from 'lucide-react'
import { useData } from '../context/DataContext'
import type { AppNotification } from '../types/phase2'

/* ── Icon per notification type ───────────────────────── */

const TYPE_CONFIG: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  cita_manana: { icon: CalendarClock, color: 'text-blue-400', bg: 'bg-blue-400/15' },
  factura_pendiente: { icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/15' },
  cita_nueva: { icon: CalendarClock, color: 'text-beta-mint', bg: 'bg-beta-mint/15' },
  consulta_completada: { icon: Stethoscope, color: 'text-emerald-400', bg: 'bg-emerald-400/15' },
}

/* ── Relative time helper ─────────────────────────────── */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Hace ${days}d`
}

/* ── Component ──────────────────────────────────────────── */

export default function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useData()

  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleNotificationClick(n: AppNotification) {
    if (!n.read) markNotificationRead(n.id)
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-clinical-white/60 transition-colors hover:bg-clinical-white/10 hover:text-clinical-white"
        title="Notificaciones"
      >
        <Bell size={20} strokeWidth={1.75} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-alert-red px-1 text-[9px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-clinical-white/10 bg-omega-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-clinical-white/[0.06] px-4 py-3">
              <h3 className="text-sm font-bold text-clinical-white">Notificaciones</h3>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-beta-mint transition-colors hover:bg-beta-mint/10"
                    title="Marcar todas leídas"
                  >
                    <CheckCheck size={12} />
                    Leer todas
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearNotifications()}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-clinical-white/30 transition-colors hover:bg-clinical-white/5 hover:text-clinical-white/50"
                    title="Limpiar"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="mx-auto text-clinical-white/15" />
                  <p className="mt-2 text-xs text-clinical-white/30">Sin notificaciones</p>
                </div>
              ) : (
                notifications.slice(0, 20).map(n => {
                  const cfg = TYPE_CONFIG[n.type] ?? { icon: Bell, color: 'text-clinical-white/50', bg: 'bg-clinical-white/5' }
                  const Icon = cfg.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-clinical-white/[0.04] ${
                        !n.read ? 'bg-omega-violet/[0.04]' : ''
                      }`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`truncate text-xs font-semibold ${!n.read ? 'text-clinical-white' : 'text-clinical-white/60'}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-beta-mint" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-clinical-white/40">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px] text-clinical-white/20">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <Check size={14} className="mt-1 shrink-0 text-clinical-white/15" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
