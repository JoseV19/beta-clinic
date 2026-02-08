import type { Patient } from '../data/patients'
import type { Transaction, MetodoPago, CategoriaGasto, Appointment } from '../context/DataContext'
import type {
  Patient as DbPatient,
  FinanceRecord,
  Appointment as DbAppointment,
  InventoryItem,
  DentalLab as DbDentalLab,
  LabOrder as DbLabOrder,
  PaymentMethod,
  ExpenseCategory,
  TransactionType,
  PatientStatus,
  InventoryCategory,
  LabOrderStatus,
} from '../types/database'

/* ═══════════════════════════════════════════════════════════════════════════
 * Bidirectional mappers: Frontend (Spanish) ↔ Database (English)
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function computeAge(dob: string | null): number {
  if (!dob) return 0
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

/* ── Patient ──────────────────────────────────────────────────────────────── */

const statusToFrontend: Record<PatientStatus, 'activo' | 'inactivo'> = {
  active: 'activo',
  inactive: 'inactivo',
  archived: 'inactivo',
}

const statusToDb: Record<string, PatientStatus> = {
  activo: 'active',
  inactivo: 'inactive',
}

export function dbPatientToFrontend(db: DbPatient): Patient {
  return {
    id: db.id,
    nombre: [db.first_name, db.last_name].filter(Boolean).join(' '),
    documento: db.document_id ?? '',
    edad: computeAge(db.dob),
    genero: (db.gender as 'M' | 'F') ?? 'M',
    telefono: db.phone ?? '',
    email: db.email ?? undefined,
    fechaNacimiento: db.dob ?? undefined,
    antecedentes: db.allergies.length > 0 ? db.allergies.join(', ') : undefined,
    ultimaVisita: db.last_visit ?? '',
    estado: statusToFrontend[db.status] ?? 'activo',
  }
}

export function frontendPatientToDb(
  fe: Omit<Patient, 'id'> & { id?: number },
): Record<string, unknown> {
  const parts = (fe.nombre ?? '').trim().split(/\s+/)
  const firstName = parts[0] ?? ''
  const lastName = parts.slice(1).join(' ') || ''

  return {
    first_name: firstName,
    last_name: lastName,
    document_id: fe.documento || null,
    gender: fe.genero || null,
    dob: fe.fechaNacimiento || null,
    phone: fe.telefono || null,
    email: fe.email || null,
    allergies: fe.antecedentes ? fe.antecedentes.split(',').map((s) => s.trim()) : [],
    last_visit: fe.ultimaVisita || null,
    status: statusToDb[fe.estado] ?? 'active',
  }
}

/* ── Finance / Transaction ────────────────────────────────────────────────── */

const tipoToFrontend: Record<TransactionType, 'ingreso' | 'gasto'> = {
  income: 'ingreso',
  expense: 'gasto',
}

const tipoToDb: Record<string, TransactionType> = {
  ingreso: 'income',
  gasto: 'expense',
}

const metodoToFrontend: Record<PaymentMethod, MetodoPago> = {
  cash: 'efectivo',
  card: 'tarjeta',
  transfer: 'transferencia',
  insurance: 'seguro',
}

const metodoToDb: Record<MetodoPago, PaymentMethod> = {
  efectivo: 'cash',
  tarjeta: 'card',
  transferencia: 'transfer',
  seguro: 'insurance',
}

const categoriaToFrontend: Record<ExpenseCategory, CategoriaGasto> = {
  rent: 'alquiler',
  utilities: 'servicios',
  payroll: 'nomina',
  supplies: 'insumos',
  maintenance: 'mantenimiento',
  marketing: 'marketing',
  other: 'otro',
}

const categoriaToDb: Record<CategoriaGasto, ExpenseCategory> = {
  alquiler: 'rent',
  servicios: 'utilities',
  nomina: 'payroll',
  insumos: 'supplies',
  mantenimiento: 'maintenance',
  marketing: 'marketing',
  otro: 'other',
}

export function dbFinanceToFrontend(db: FinanceRecord): Transaction {
  return {
    id: db.id,
    fecha: db.date,
    concepto: db.concept,
    monto: db.amount_usd,
    tipo: tipoToFrontend[db.type] ?? 'ingreso',
    metodo: db.payment_method ? metodoToFrontend[db.payment_method] : undefined,
    paciente: db.notes ?? undefined,
    anulado: db.voided,
    categoria: db.category ? categoriaToFrontend[db.category] : undefined,
    comprobante: db.receipt_url ?? undefined,
  }
}

export function frontendTransactionToDb(
  fe: Omit<Transaction, 'id'>,
): Record<string, unknown> {
  return {
    type: tipoToDb[fe.tipo] ?? 'income',
    concept: fe.concepto,
    amount_usd: fe.monto,
    date: fe.fecha,
    payment_method: fe.metodo ? metodoToDb[fe.metodo] : null,
    category: fe.categoria ? categoriaToDb[fe.categoria] : null,
    voided: fe.anulado ?? false,
    receipt_url: fe.comprobante ?? null,
    notes: fe.paciente ?? null,
  }
}

/* ── Appointment ──────────────────────────────────────────────────────────── */

export function dbAppointmentToFrontend(
  db: DbAppointment & { patient_name?: string; doctor_name?: string },
): Appointment {
  const time = new Date(db.start_time).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  return {
    patient: db.patient_name ?? `Paciente #${db.patient_id}`,
    time,
    doctor: db.doctor_name ?? '',
    status: db.status,
  }
}

/* ── Inventory ────────────────────────────────────────────────────────────── */

export interface FrontendProduct {
  id: number
  nombre: string
  sku: string
  categoria: 'Medicamento' | 'Insumo' | 'Equipo'
  stock: number
  minStock: number
  fechaVencimiento: string
  precioUnitario: number
  proveedor: string
}

const inventoryCatToFrontend: Record<InventoryCategory, FrontendProduct['categoria']> = {
  medication: 'Medicamento',
  supply: 'Insumo',
  equipment: 'Equipo',
}

const inventoryCatToDb: Record<FrontendProduct['categoria'], InventoryCategory> = {
  Medicamento: 'medication',
  Insumo: 'supply',
  Equipo: 'equipment',
}

export function dbInventoryToFrontend(db: InventoryItem): FrontendProduct {
  return {
    id: db.id,
    nombre: db.item_name,
    sku: db.sku ?? '',
    categoria: inventoryCatToFrontend[db.category] ?? 'Insumo',
    stock: db.quantity,
    minStock: db.min_stock,
    fechaVencimiento: db.expiration_date ?? '',
    precioUnitario: db.unit_price_usd,
    proveedor: db.supplier ?? '',
  }
}

export function frontendInventoryToDb(
  fe: Omit<FrontendProduct, 'id'>,
): Record<string, unknown> {
  return {
    item_name: fe.nombre,
    sku: fe.sku || null,
    category: inventoryCatToDb[fe.categoria] ?? 'supply',
    quantity: fe.stock,
    min_stock: fe.minStock ?? 5,
    unit_price_usd: fe.precioUnitario,
    expiration_date: fe.fechaVencimiento || null,
    supplier: fe.proveedor || null,
  }
}

/* ── Dental Lab ───────────────────────────────────────────────────────────── */

export interface FrontendDentalLab {
  id: number
  nombre: string
  contacto: string
  whatsapp: string
  servicios: string[]
}

export function dbDentalLabToFrontend(db: DbDentalLab): FrontendDentalLab {
  return {
    id: db.id,
    nombre: db.name,
    contacto: db.contact,
    whatsapp: db.whatsapp,
    servicios: db.services,
  }
}

export function frontendLabToDb(
  fe: Omit<FrontendDentalLab, 'id'>,
): Record<string, unknown> {
  return {
    name: fe.nombre,
    contact: fe.contacto,
    whatsapp: fe.whatsapp,
    services: fe.servicios,
  }
}

/* ── Lab Order ────────────────────────────────────────────────────────────── */

export type FrontendLabStatus = 'por_enviar' | 'enviado' | 'recibido' | 'entregado'

export interface FrontendLabOrder {
  id: number
  paciente: string
  pacienteFoto?: string
  trabajo: string
  pieza: string
  laboratorio: string
  labWhatsApp: string
  colorCode: string
  fechaCreacion: string
  fechaEntrega: string
  status: FrontendLabStatus
  notas?: string
}

const labStatusToFrontend: Record<LabOrderStatus, FrontendLabStatus> = {
  pending: 'por_enviar',
  sent: 'enviado',
  received: 'recibido',
  delivered: 'entregado',
}

const labStatusToDb: Record<FrontendLabStatus, LabOrderStatus> = {
  por_enviar: 'pending',
  enviado: 'sent',
  recibido: 'received',
  entregado: 'delivered',
}

export function dbLabOrderToFrontend(
  db: DbLabOrder & { patient_name?: string; lab_name?: string; lab_whatsapp?: string },
): FrontendLabOrder {
  return {
    id: db.id,
    paciente: db.patient_name ?? `Paciente #${db.patient_id}`,
    trabajo: db.work_type,
    pieza: db.tooth,
    laboratorio: db.lab_name ?? `Lab #${db.lab_id}`,
    labWhatsApp: db.lab_whatsapp ?? '',
    colorCode: db.shade_code ?? '',
    fechaCreacion: db.created_at.split('T')[0],
    fechaEntrega: db.due_date,
    status: labStatusToFrontend[db.status] ?? 'por_enviar',
    notas: db.notes ?? undefined,
  }
}

export { labStatusToDb }
