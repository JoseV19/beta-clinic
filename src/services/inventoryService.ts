import type { SupabaseClient } from '@supabase/supabase-js'
import type { InventoryItem } from '../types/database'

export async function fetchInventory(supabase: SupabaseClient): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('item_name')

  if (error) throw new Error(`Error al cargar inventario: ${error.message}`)
  return data as InventoryItem[]
}

export async function createInventoryItem(
  supabase: SupabaseClient,
  item: Record<string, unknown>,
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .insert(item)
    .select()
    .single()

  if (error) throw new Error(`Error al agregar artículo: ${error.message}`)
  return data as InventoryItem
}

export async function updateInventoryItem(
  supabase: SupabaseClient,
  id: number,
  updates: Record<string, unknown>,
): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Error al actualizar artículo: ${error.message}`)
  return data as InventoryItem
}

export async function updateInventoryQuantity(
  supabase: SupabaseClient,
  id: number,
  quantity: number,
): Promise<void> {
  const { error } = await supabase
    .from('inventory')
    .update({ quantity })
    .eq('id', id)

  if (error) throw new Error(`Error al ajustar stock: ${error.message}`)
}
