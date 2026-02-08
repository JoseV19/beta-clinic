import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useSupabase } from '../context/SupabaseContext'
import {
  fetchInventory,
  createInventoryItem,
  updateInventoryQuantity,
} from '../services/inventoryService'
import { dbInventoryToFrontend, frontendInventoryToDb } from '../services/mappers'

/* ── Types ─────────────────────────────────────────────── */

export interface Product {
  id: number
  nombre: string
  sku: string
  categoria: 'Medicamento' | 'Insumo' | 'Equipo'
  stock: number
  fechaVencimiento: string
  precioUnitario: number
}

/* ── Hook ──────────────────────────────────────────────── */

export function useInventory() {
  const { supabase, profile, loading: authLoading } = useSupabase()
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const dbItems = await fetchInventory(supabase)
      setItems(dbItems.map((i) => {
        const fe = dbInventoryToFrontend(i)
        return {
          id: fe.id,
          nombre: fe.nombre,
          sku: fe.sku,
          categoria: fe.categoria,
          stock: fe.stock,
          fechaVencimiento: fe.fechaVencimiento,
          precioUnitario: fe.precioUnitario,
        }
      }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar inventario')
    } finally {
      setLoading(false)
    }
  }, [supabase, profile])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setItems([])
      setLoading(false)
      return
    }
    load()
  }, [authLoading, profile, load])

  const addItem = useCallback(
    async (data: Omit<Product, 'id'>) => {
      try {
        const dbData = frontendInventoryToDb({
          ...data,
          minStock: 5,
          proveedor: '',
        })
        const created = await createInventoryItem(supabase, dbData)
        const fe = dbInventoryToFrontend(created)
        setItems((prev) => [{
          id: fe.id,
          nombre: fe.nombre,
          sku: fe.sku,
          categoria: fe.categoria,
          stock: fe.stock,
          fechaVencimiento: fe.fechaVencimiento,
          precioUnitario: fe.precioUnitario,
        }, ...prev])
        toast.success('Producto agregado al inventario')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al agregar producto')
      }
    },
    [supabase],
  )

  const adjustStock = useCallback(
    async (id: number, delta: number) => {
      const item = items.find((i) => i.id === id)
      if (!item) return
      const newQty = Math.max(0, item.stock + delta)
      try {
        await updateInventoryQuantity(supabase, id, newQty)
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, stock: newQty } : i)),
        )
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al ajustar stock')
      }
    },
    [supabase, items],
  )

  return { items, loading, addItem, adjustStock, refresh: load }
}
