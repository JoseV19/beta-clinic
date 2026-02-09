/* ═══════════════════════════════════════════════════════════════════════════
 * Beta Clinic — Tipos TypeScript para la base de datos Supabase
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Enums (espejan los tipos de PostgreSQL) ───────────────────────────── */

export type AppRole = 'admin' | 'doctor' | 'patient'

export type ClinicSpecialty = 'general' | 'dental' | 'pediatrics' | 'nutrition'

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type PatientStatus = 'active' | 'inactive' | 'archived'

export type InventoryCategory = 'medication' | 'supply' | 'equipment'

export type LabOrderStatus = 'pending' | 'sent' | 'received' | 'delivered'

export type ReminderChannel = 'whatsapp' | 'sms' | 'email'

/* ── Tablas ─────────────────────────────────────────────────────────────── */

export interface Profile {
  id: string                       // uuid — FK a auth.users
  role: AppRole
  full_name: string
  specialty: ClinicSpecialty | null
  phone: string | null
  avatar_url: string | null
  license_no: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: number
  user_id: string | null           // uuid — FK a profiles
  first_name: string
  last_name: string
  document_id: string | null
  gender: 'M' | 'F' | null
  dob: string | null
  phone: string | null
  email: string | null
  blood_type: string | null
  allergies: string[]
  insurance: string | null
  status: PatientStatus
  last_visit: string | null
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: number
  name: string
  description: string | null
  specialty: ClinicSpecialty
  price_usd: number
  price_gtq: number               // GENERATED — USD × 7.75
  duration_min: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  doctor_id: string                // uuid
  patient_id: number
  treatment_id: number | null
  start_time: string
  end_time: string
  status: AppointmentStatus
  type: ClinicSpecialty
  reason: string | null
  notes: string | null
  room: string | null
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: string                // uuid
  appointment_id: number | null
  record_type: ClinicSpecialty
  diagnosis: string | null
  notes: string | null
  data: Record<string, unknown>    // JSONB
  attachments: string[]
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: number
  item_name: string
  sku: string | null
  category: InventoryCategory
  quantity: number
  min_stock: number
  unit_price_usd: number
  expiration_date: string | null
  supplier: string | null
  created_at: string
  updated_at: string
}

export interface DentalLab {
  id: number
  name: string
  contact: string
  whatsapp: string
  services: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface LabOrder {
  id: number
  patient_id: number
  lab_id: number
  doctor_id: string                // uuid
  work_type: string
  tooth: string
  shade_code: string | null
  status: LabOrderStatus
  due_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: number
  appointment_id: number
  patient_id: number
  channel: ReminderChannel
  message: string
  sent_at: string
  delivered: boolean
}

/* ── CIE-10 (ICD-10) ──────────────────────────────────────────────────── */

export interface CIE10Code {
  codigo: string       // e.g. "J06.9"
  descripcion: string  // e.g. "Infección aguda de las vías respiratorias superiores"
  capitulo?: string    // e.g. "X"
}

/* ── Facturación ───────────────────────────────────────────────────────── */

export type InvoiceStatus = 'borrador' | 'emitida' | 'pagada' | 'anulada'
export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia'
export type InvoiceCurrency = 'USD' | 'GTQ'

export interface InvoiceItem {
  id: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

export interface Invoice {
  id: number
  numero: string
  fecha: string
  pacienteId: number
  pacienteNombre: string
  nit: string
  items: InvoiceItem[]
  subtotal: number
  iva: number
  total: number
  currency: InvoiceCurrency
  estado: InvoiceStatus
  metodoPago?: PaymentMethod
  notas?: string
  felAutorizacion?: string
  felSerie?: string
  createdAt: string
  updatedAt: string
}

/* ── WhatsApp ──────────────────────────────────────────────────────────── */

export type WhatsAppMessageStatus = 'pendiente' | 'enviado' | 'entregado' | 'error'

export interface WhatsAppMessage {
  id: string
  pacienteId?: number
  phone: string
  message: string
  templateId?: string
  status: WhatsAppMessageStatus
  sentAt?: string
  channel: 'wa_link' | 'wa_api'
}
