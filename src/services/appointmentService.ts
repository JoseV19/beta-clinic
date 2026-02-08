import type { SupabaseClient } from '@supabase/supabase-js'
import type { Appointment as DbAppointment, AppointmentStatus } from '../types/database'

export type DbAppointmentWithNames = DbAppointment & {
  patient_name?: string
  doctor_name?: string
}

export async function fetchAppointments(
  supabase: SupabaseClient,
): Promise<DbAppointmentWithNames[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients!inner ( first_name, last_name ),
      profiles!inner ( full_name )
    `)
    .order('start_time', { ascending: false })

  if (error) throw new Error(`Error al cargar citas: ${error.message}`)

  return (data ?? []).map((row: Record<string, unknown>) => {
    const patients = row.patients as { first_name: string; last_name: string } | null
    const profiles = row.profiles as { full_name: string } | null
    const { patients: _p, profiles: _pr, ...rest } = row
    return {
      ...rest,
      patient_name: patients
        ? `${patients.first_name} ${patients.last_name}`
        : undefined,
      doctor_name: profiles?.full_name ?? undefined,
    } as unknown as DbAppointmentWithNames
  })
}

export async function createAppointment(
  supabase: SupabaseClient,
  appointment: Record<string, unknown>,
): Promise<DbAppointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single()

  if (error) throw new Error(`Error al crear cita: ${error.message}`)
  return data as DbAppointment
}

export async function updateAppointment(
  supabase: SupabaseClient,
  id: number,
  updates: Record<string, unknown>,
): Promise<DbAppointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Error al actualizar cita: ${error.message}`)
  return data as DbAppointment
}

export async function updateAppointmentStatus(
  supabase: SupabaseClient,
  id: number,
  status: AppointmentStatus,
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(`Error al cambiar estado de cita: ${error.message}`)
}
