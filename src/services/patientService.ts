import type { SupabaseClient } from '@supabase/supabase-js'
import type { Patient as DbPatient } from '../types/database'

export async function fetchPatients(supabase: SupabaseClient): Promise<DbPatient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('last_name')

  if (error) throw new Error(`Error al cargar pacientes: ${error.message}`)
  return data as DbPatient[]
}

export async function createPatient(
  supabase: SupabaseClient,
  patient: Record<string, unknown>,
): Promise<DbPatient> {
  const { data, error } = await supabase
    .from('patients')
    .insert(patient)
    .select()
    .single()

  if (error) throw new Error(`Error al crear paciente: ${error.message}`)
  return data as DbPatient
}

export async function updatePatient(
  supabase: SupabaseClient,
  id: number,
  updates: Record<string, unknown>,
): Promise<DbPatient> {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Error al actualizar paciente: ${error.message}`)
  return data as DbPatient
}

export async function deletePatient(
  supabase: SupabaseClient,
  id: number,
): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Error al eliminar paciente: ${error.message}`)
}
