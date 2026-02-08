import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useSupabase } from '../context/SupabaseContext'
import {
  fetchDentalLabs,
  createDentalLab,
  updateDentalLab,
  deleteDentalLab,
} from '../services/dentalLabService'
import { dbDentalLabToFrontend, frontendLabToDb } from '../services/mappers'

/* ── Types ─────────────────────────────────────────────── */

export interface DentalLab {
  id: number
  nombre: string
  contacto: string
  whatsapp: string
  servicios: string[]
}

/* ── Service catalog ──────────────────────────────────── */

export const LAB_SERVICES = [
  'Cerámica',
  'Zirconia',
  'Metal-Porcelana',
  'E.max',
  'Acrílico',
  'Flexible',
  'Metal (Cr-Co)',
  'Guardas',
  'Ortodoncia',
  'Implantes',
  'CAD/CAM',
  'Blanqueamiento',
] as const

export type LabService = (typeof LAB_SERVICES)[number]

/* ── Hook ─────────────────────────────────────────────── */

export function useDentalLabs() {
  const { supabase, profile, loading: authLoading } = useSupabase()
  const [labs, setLabs] = useState<DentalLab[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const dbLabs = await fetchDentalLabs(supabase)
      setLabs(dbLabs.map(dbDentalLabToFrontend))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar laboratorios')
    } finally {
      setLoading(false)
    }
  }, [supabase, profile])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setLabs([])
      setLoading(false)
      return
    }
    load()
  }, [authLoading, profile, load])

  const addLab = useCallback(
    async (data: Omit<DentalLab, 'id'>) => {
      try {
        const dbData = frontendLabToDb(data)
        const created = await createDentalLab(supabase, dbData)
        setLabs((prev) => [...prev, dbDentalLabToFrontend(created)])
        toast.success('Laboratorio agregado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al agregar laboratorio')
      }
    },
    [supabase],
  )

  const updateLab = useCallback(
    async (id: number, data: Omit<DentalLab, 'id'>) => {
      try {
        const dbData = frontendLabToDb(data)
        const updated = await updateDentalLab(supabase, id, dbData)
        setLabs((prev) => prev.map((l) => (l.id === id ? dbDentalLabToFrontend(updated) : l)))
        toast.success('Laboratorio actualizado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al actualizar laboratorio')
      }
    },
    [supabase],
  )

  const deleteLab = useCallback(
    async (id: number) => {
      try {
        await deleteDentalLab(supabase, id)
        setLabs((prev) => prev.filter((l) => l.id !== id))
        toast.success('Laboratorio eliminado')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al eliminar laboratorio')
      }
    },
    [supabase],
  )

  return { labs, loading, addLab, updateLab, deleteLab, refresh: load }
}
