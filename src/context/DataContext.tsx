import { createContext, useContext, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { mockPatients as defaultPatients, type Patient } from '../data/patients'

/* ── Types ─────────────────────────────────────────────── */

export interface Transaction {
  id: number
  fecha: string
  concepto: string
  monto: number
  tipo: 'ingreso' | 'gasto'
}

export interface Appointment {
  patient: string
  time: string
  doctor: string
  status: string
}

/* ── Default data ─────────────────────────────────────── */

const defaultAppointments: Appointment[] = [
  { patient: 'María García', time: '09:00 AM', doctor: 'Dr. Rodríguez', status: 'Confirmada' },
  { patient: 'Carlos López', time: '09:30 AM', doctor: 'Dra. Martínez', status: 'Pendiente' },
  { patient: 'Ana Torres', time: '10:00 AM', doctor: 'Dr. Rodríguez', status: 'Confirmada' },
  { patient: 'Luis Ramírez', time: '10:30 AM', doctor: 'Dr. Herrera', status: 'Cancelada' },
  { patient: 'Sofía Mendoza', time: '11:00 AM', doctor: 'Dra. Martínez', status: 'Pendiente' },
  { patient: 'Jorge Castillo', time: '11:30 AM', doctor: 'Dr. Herrera', status: 'Confirmada' },
]

const defaultTransactions: Transaction[] = [
  { id: 1, fecha: '2026-02-05', concepto: 'Consulta General — María García', monto: 85000, tipo: 'ingreso' },
  { id: 2, fecha: '2026-02-05', concepto: 'Consulta Especialista — Carlos López', monto: 120000, tipo: 'ingreso' },
  { id: 3, fecha: '2026-02-04', concepto: 'Compra insumos médicos', monto: 340000, tipo: 'gasto' },
  { id: 4, fecha: '2026-02-04', concepto: 'Ecografía — Ana Torres', monto: 95000, tipo: 'ingreso' },
  { id: 5, fecha: '2026-02-03', concepto: 'Servicio de aseo clínico', monto: 150000, tipo: 'gasto' },
  { id: 6, fecha: '2026-02-03', concepto: 'Control hipertensión — Luis Ramírez', monto: 75000, tipo: 'ingreso' },
  { id: 7, fecha: '2026-02-02', concepto: 'Mantenimiento equipos', monto: 280000, tipo: 'gasto' },
  { id: 8, fecha: '2026-02-02', concepto: 'Laboratorio — Sofía Mendoza', monto: 65000, tipo: 'ingreso' },
  { id: 9, fecha: '2026-02-01', concepto: 'Pago nómina asistentes', monto: 1200000, tipo: 'gasto' },
  { id: 10, fecha: '2026-02-01', concepto: 'Telemedicina — Jorge Castillo', monto: 70000, tipo: 'ingreso' },
  { id: 11, fecha: '2026-01-31', concepto: 'Consulta General — Valentina Ruiz', monto: 85000, tipo: 'ingreso' },
  { id: 12, fecha: '2026-01-31', concepto: 'Arriendo consultorio', monto: 2500000, tipo: 'gasto' },
]

/* ── Context ──────────────────────────────────────────── */

interface DataContextValue {
  patients: Patient[]
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
  appointments: Appointment[]
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = usePersistentState<Patient[]>('beta_patients', defaultPatients)
  const [appointments, setAppointments] = usePersistentState<Appointment[]>('beta_appointments', defaultAppointments)
  const [transactions, setTransactions] = usePersistentState<Transaction[]>('beta_finance', defaultTransactions)

  return (
    <DataContext.Provider value={{ patients, setPatients, appointments, setAppointments, transactions, setTransactions }}>
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
