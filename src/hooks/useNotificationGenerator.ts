import { useEffect, useRef } from 'react'
import { useData } from '../context/DataContext'

/**
 * Auto-generates notifications based on data state:
 * - Appointments tomorrow → "Cita mañana"
 * - Invoices pending > 7 days → "Factura pendiente"
 *
 * Run this hook in MainLayout so it executes once on app mount.
 */
export function useNotificationGenerator() {
  const {
    appointments,
    invoices,
    notifications,
    addNotification,
  } = useData()

  const hasRun = useRef(false)

  useEffect(() => {
    // Only run once per session to avoid spam
    if (hasRun.current) return
    hasRun.current = true

    const existingKeys = new Set(
      notifications.map(n => `${n.type}_${n.entityType}_${n.entityId}`),
    )

    // ── Citas de mañana ───────────────────────────────
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    appointments
      .filter(a => a.fecha === tomorrowStr && a.estado !== 'cancelada')
      .forEach(a => {
        const key = `cita_manana_appointment_${a.id}`
        if (existingKeys.has(key)) return
        addNotification({
          type: 'cita_manana',
          title: 'Cita mañana',
          message: `${a.patientName} tiene cita a las ${a.hora} con ${a.doctor}`,
          entityId: a.id,
          entityType: 'appointment',
        })
      })

    // ── Facturas pendientes > 7 días ──────────────────
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

    invoices
      .filter(i => i.estado === 'emitida' && i.fecha <= sevenDaysAgoStr)
      .forEach(i => {
        const key = `factura_pendiente_invoice_${i.id}`
        if (existingKeys.has(key)) return
        addNotification({
          type: 'factura_pendiente',
          title: 'Factura pendiente',
          message: `Factura ${i.numero} tiene más de 7 días sin pagar`,
          entityId: i.id,
          entityType: 'invoice',
        })
      })
  }, [appointments, invoices, notifications, addNotification])
}
