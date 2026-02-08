import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useSupabase } from '../context/SupabaseContext'
import {
  fetchLabOrders,
  createLabOrder,
  updateLabOrderStatus,
} from '../services/labOrderService'
import {
  dbLabOrderToFrontend,
  labStatusToDb,
  type FrontendLabOrder,
  type FrontendLabStatus,
} from '../services/mappers'

export type { FrontendLabOrder, FrontendLabStatus }

/* ── Hook ──────────────────────────────────────────────── */

export function useLabOrders() {
  const { supabase, profile, loading: authLoading } = useSupabase()
  const [orders, setOrders] = useState<FrontendLabOrder[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const dbOrders = await fetchLabOrders(supabase)
      setOrders(dbOrders.map(dbLabOrderToFrontend))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar órdenes de lab')
    } finally {
      setLoading(false)
    }
  }, [supabase, profile])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setOrders([])
      setLoading(false)
      return
    }
    load()
  }, [authLoading, profile, load])

  const addOrder = useCallback(
    async (data: {
      patient_id: number
      lab_id: number
      work_type: string
      tooth: string
      shade_code: string
      due_date: string
      notes?: string
    }) => {
      try {
        const dbData = {
          patient_id: data.patient_id,
          lab_id: data.lab_id,
          doctor_id: profile!.id,
          work_type: data.work_type,
          tooth: data.tooth,
          shade_code: data.shade_code || null,
          due_date: data.due_date,
          notes: data.notes || null,
          status: 'pending' as const,
        }
        const created = await createLabOrder(supabase, dbData)
        // Re-fetch to get joined patient/lab names
        await load()
        toast.success('Orden de laboratorio creada')
        return created
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al crear orden de lab')
      }
    },
    [supabase, profile, load],
  )

  const moveOrder = useCallback(
    async (id: number, newStatus: FrontendLabStatus) => {
      const dbStatus = labStatusToDb[newStatus]
      try {
        await updateLabOrderStatus(supabase, id, dbStatus)
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al cambiar estado de orden')
      }
    },
    [supabase],
  )

  return { orders, loading, addOrder, moveOrder, refresh: load }
}
