import type { SupabaseClient } from '@supabase/supabase-js'
import type { LabOrder, LabOrderStatus } from '../types/database'

export type DbLabOrderWithNames = LabOrder & {
  patient_name?: string
  lab_name?: string
  lab_whatsapp?: string
}

export async function fetchLabOrders(
  supabase: SupabaseClient,
): Promise<DbLabOrderWithNames[]> {
  const { data, error } = await supabase
    .from('lab_orders')
    .select(`
      *,
      patients!inner ( first_name, last_name ),
      dental_labs!inner ( name, whatsapp )
    `)
    .order('due_date')

  if (error) throw new Error(`Error al cargar órdenes de lab: ${error.message}`)

  return (data ?? []).map((row: Record<string, unknown>) => {
    const patients = row.patients as { first_name: string; last_name: string } | null
    const labs = row.dental_labs as { name: string; whatsapp: string } | null
    const { patients: _p, dental_labs: _dl, ...rest } = row
    return {
      ...rest,
      patient_name: patients
        ? `${patients.first_name} ${patients.last_name}`
        : undefined,
      lab_name: labs?.name ?? undefined,
      lab_whatsapp: labs?.whatsapp ?? undefined,
    } as unknown as DbLabOrderWithNames
  })
}

export async function createLabOrder(
  supabase: SupabaseClient,
  order: Record<string, unknown>,
): Promise<LabOrder> {
  const { data, error } = await supabase
    .from('lab_orders')
    .insert(order)
    .select()
    .single()

  if (error) throw new Error(`Error al crear orden de lab: ${error.message}`)
  return data as LabOrder
}

export async function updateLabOrderStatus(
  supabase: SupabaseClient,
  id: number,
  status: LabOrderStatus,
): Promise<void> {
  const { error } = await supabase
    .from('lab_orders')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(`Error al cambiar estado de orden: ${error.message}`)
}
