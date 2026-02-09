import type { WhatsAppMessage, WhatsAppMessageStatus } from '../types/database'

/* ── Guatemala phone formatting ─────────────────────── */

const COUNTRY_CODE = '502'

export function formatGuatemalaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('502')) return digits
  return `${COUNTRY_CODE}${digits}`
}

export function displayPhone(phone: string): string {
  const clean = formatGuatemalaPhone(phone)
  return `+${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`
}

/* ── Message templates ──────────────────────────────── */

export interface MessageTemplate {
  id: string
  name: string
  clinicType: string
  template: (vars: Record<string, string>) => string
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'reminder-24h',
    name: 'Recordatorio 24h',
    clinicType: 'all',
    template: (v) =>
      `Hola ${v.nombre}, le recordamos su cita mañana a las ${v.hora} en Beta Clinic.\n\n¡Lo esperamos!`,
  },
  {
    id: 'reminder-dental',
    name: 'Recordatorio Dental',
    clinicType: 'dental',
    template: (v) =>
      `Hola ${v.nombre}, recuerda tu cita de limpieza mañana a las ${v.hora}. Tu sonrisa te espera.\n\n— Beta Clinic`,
  },
  {
    id: 'reminder-pediatrics',
    name: 'Recordatorio Pediatría',
    clinicType: 'pediatrics',
    template: (v) =>
      `Hola ${v.nombre}, le recordamos la cita de su pequeño(a) mañana a las ${v.hora}.\n\n— Beta Clinic`,
  },
  {
    id: 'reminder-nutrition',
    name: 'Recordatorio Nutrición',
    clinicType: 'nutrition',
    template: (v) =>
      `Hola ${v.nombre}, mañana tienes tu consulta nutricional a las ${v.hora}. ¡No olvides traer tu diario de alimentación!\n\n— Beta Clinic`,
  },
  {
    id: 'appointment-confirmed',
    name: 'Cita Confirmada',
    clinicType: 'all',
    template: (v) =>
      `Hola ${v.nombre}, su cita ha sido confirmada para el ${v.fecha} a las ${v.hora} con ${v.doctor}.\n\n— Beta Clinic`,
  },
  {
    id: 'invoice-sent',
    name: 'Factura Enviada',
    clinicType: 'all',
    template: (v) =>
      `Hola ${v.nombre}, su factura ${v.numero} por ${v.total} ha sido generada. Gracias por su confianza.\n\n— Beta Clinic`,
  },
  {
    id: 'prescription-ready',
    name: 'Receta Lista',
    clinicType: 'all',
    template: (v) =>
      `Hola ${v.nombre}, su receta médica está lista. Puede recogerla en la farmacia de su preferencia.\n\n— Beta Clinic`,
  },
]

/* ── Send via wa.me link ────────────────────────────── */

export function openWhatsApp(phone: string, message: string): void {
  const cleanPhone = formatGuatemalaPhone(phone)
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
}

/* ── Message tracking (localStorage) ────────────────── */

const LS_KEY = 'beta_whatsapp_messages'

export function getMessageHistory(): WhatsAppMessage[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function trackMessage(msg: Omit<WhatsAppMessage, 'id'>): WhatsAppMessage {
  const entry: WhatsAppMessage = {
    ...msg,
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  }
  const history = getMessageHistory()
  history.unshift(entry)
  if (history.length > 500) history.length = 500
  localStorage.setItem(LS_KEY, JSON.stringify(history))
  return entry
}

export function updateMessageStatus(id: string, status: WhatsAppMessageStatus): void {
  const history = getMessageHistory()
  const msg = history.find(m => m.id === id)
  if (msg) {
    msg.status = status
    if (status === 'enviado') msg.sentAt = new Date().toISOString()
    localStorage.setItem(LS_KEY, JSON.stringify(history))
  }
}

/* ── Future: WhatsApp Business API ──────────────────── */

export async function sendViaBusinessAPI(
  _phone: string,
  _templateName: string,
  _templateVars: Record<string, string>,
): Promise<{ success: boolean; messageId?: string }> {
  throw new Error('WhatsApp Business API no está configurado. Se requiere un Edge Function.')
}
