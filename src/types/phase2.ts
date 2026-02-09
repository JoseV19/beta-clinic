/* ═══════════════════════════════════════════════════════════════════════════
 * Beta Clinic — Phase 2 shared types
 * ═══════════════════════════════════════════════════════════════════════════ */

export type AppointmentType = 'consulta' | 'control' | 'especialista' | 'urgencia' | 'laboratorio'
export type AppointmentStatus = 'confirmada' | 'pendiente' | 'completada' | 'cancelada' | 'no_show'
export type ConsultationType = 'general' | 'especialista' | 'urgencia' | 'control' | 'telemedicina'
export type ConsultationStatus = 'completada' | 'en_curso' | 'pendiente' | 'cancelada'

export interface SoapNotes {
  subjetivo: string
  objetivo: string
  analisis: string
  plan: string
}

export interface DiagnosticoCIE10 {
  codigo: string
  descripcion: string
}

export interface AgendaAppointment {
  id: number
  patientId: number
  patientName: string
  fecha: string          // YYYY-MM-DD
  hora: string           // HH:mm
  duracion: number       // minutos
  tipo: AppointmentType
  doctor: string
  estado: AppointmentStatus
  notas?: string
  createdAt: string
  updatedAt: string
}

export interface Consultation {
  id: number
  patientId: number
  patientName: string
  appointmentId?: number
  fecha: string
  hora: string
  motivo: string
  tipo: ConsultationType
  doctor: string
  estado: ConsultationStatus
  soap?: SoapNotes
  diagnosticoCIE10?: DiagnosticoCIE10[]
  createdAt: string
  updatedAt: string
}

export type NotificationType = 'cita_manana' | 'factura_pendiente' | 'cita_nueva' | 'consulta_completada'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  entityId?: number
  entityType?: 'appointment' | 'invoice' | 'consultation'
  createdAt: string
}

/* Re-export invoice types for convenience */
export type { Invoice, InvoiceItem, InvoiceStatus, InvoiceCurrency, PaymentMethod } from './database'
