import type { SupabaseClient } from '@supabase/supabase-js'
import type { FinanceRecord } from '../types/database'

export async function fetchFinance(supabase: SupabaseClient): Promise<FinanceRecord[]> {
  const { data, error } = await supabase
    .from('finance')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw new Error(`Error al cargar finanzas: ${error.message}`)
  return data as FinanceRecord[]
}

export async function createFinance(
  supabase: SupabaseClient,
  record: Record<string, unknown>,
): Promise<FinanceRecord> {
  const { data, error } = await supabase
    .from('finance')
    .insert(record)
    .select()
    .single()

  if (error) throw new Error(`Error al registrar movimiento: ${error.message}`)
  return data as FinanceRecord
}

export async function voidFinance(
  supabase: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from('finance')
    .update({ voided: true })
    .eq('id', id)

  if (error) throw new Error(`Error al anular movimiento: ${error.message}`)
}
