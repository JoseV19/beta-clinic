import type { SupabaseClient } from '@supabase/supabase-js'
import type { DentalLab } from '../types/database'

export async function fetchDentalLabs(supabase: SupabaseClient): Promise<DentalLab[]> {
  const { data, error } = await supabase
    .from('dental_labs')
    .select('*')
    .eq('active', true)
    .order('name')

  if (error) throw new Error(`Error al cargar laboratorios: ${error.message}`)
  return data as DentalLab[]
}

export async function createDentalLab(
  supabase: SupabaseClient,
  lab: Record<string, unknown>,
): Promise<DentalLab> {
  const { data, error } = await supabase
    .from('dental_labs')
    .insert(lab)
    .select()
    .single()

  if (error) throw new Error(`Error al crear laboratorio: ${error.message}`)
  return data as DentalLab
}

export async function updateDentalLab(
  supabase: SupabaseClient,
  id: number,
  updates: Record<string, unknown>,
): Promise<DentalLab> {
  const { data, error } = await supabase
    .from('dental_labs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Error al actualizar laboratorio: ${error.message}`)
  return data as DentalLab
}

export async function deleteDentalLab(
  supabase: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from('dental_labs')
    .update({ active: false })
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar laboratorio: ${error.message}`)
}
