import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useSupabase } from './SupabaseContext'
import type { Patient } from '../data/patients'
import {
  dbPatientToFrontend,
  frontendPatientToDb,
  dbFinanceToFrontend,
  frontendTransactionToDb,
  dbAppointmentToFrontend,
} from '../services/mappers'
import {
  fetchPatients as svcFetchPatients,
  createPatient as svcCreatePatient,
  updatePatient as svcUpdatePatient,
  deletePatient as svcDeletePatient,
} from '../services/patientService'
import {
  fetchFinance as svcFetchFinance,
  createFinance as svcCreateFinance,
  voidFinance as svcVoidFinance,
} from '../services/financeService'
import { fetchAppointments as svcFetchAppointments } from '../services/appointmentService'

/* ── Types ─────────────────────────────────────────────── */

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'seguro'
export type CategoriaGasto = 'alquiler' | 'servicios' | 'nomina' | 'insumos' | 'mantenimiento' | 'marketing' | 'otro'

export interface Transaction {
  id: number
  fecha: string
  concepto: string
  monto: number
  tipo: 'ingreso' | 'gasto'
  metodo?: MetodoPago
  paciente?: string
  anulado?: boolean
  categoria?: CategoriaGasto
  comprobante?: string
}

export interface Appointment {
  patient: string
  time: string
  doctor: string
  status: string
}

/* ── Context ──────────────────────────────────────────── */

interface DataContextValue {
  patients: Patient[]
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
  appointments: Appointment[]
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>
  transactions: Transaction[]
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>

  /* Async CRUD */
  addPatient: (data: Omit<Patient, 'id'>) => Promise<void>
  updatePatient: (updated: Patient) => Promise<void>
  deletePatient: (id: number) => Promise<void>
  addTransaction: (data: Omit<Transaction, 'id'>) => Promise<void>
  voidTransaction: (id: number) => Promise<void>
  refresh: () => Promise<void>

  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { supabase, profile, loading: authLoading } = useSupabase()

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ── Fetch all data ────────────────────────────────── */

  const fetchAll = useCallback(async () => {
    if (!profile) return

    setLoading(true)
    setError(null)

    try {
      const [dbPatients, dbFinance, dbAppointments] = await Promise.all([
        svcFetchPatients(supabase),
        svcFetchFinance(supabase),
        svcFetchAppointments(supabase),
      ])

      setPatients(dbPatients.map(dbPatientToFrontend))
      setTransactions(dbFinance.map(dbFinanceToFrontend))
      setAppointments(dbAppointments.map(dbAppointmentToFrontend))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [supabase, profile])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setPatients([])
      setTransactions([])
      setAppointments([])
      setLoading(false)
      return
    }
    fetchAll()
  }, [authLoading, profile, fetchAll])

  /* ── Patient CRUD ──────────────────────────────────── */

  const addPatient = useCallback(async (data: Omit<Patient, 'id'>) => {
    try {
      const dbData = frontendPatientToDb(data as Patient)
      const created = await svcCreatePatient(supabase, dbData)
      setPatients((prev) => [dbPatientToFrontend(created), ...prev])
      toast.success('Paciente registrado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear paciente')
    }
  }, [supabase])

  const updatePatientFn = useCallback(async (updated: Patient) => {
    try {
      const dbData = frontendPatientToDb(updated)
      const result = await svcUpdatePatient(supabase, updated.id, dbData)
      setPatients((prev) =>
        prev.map((p) => (p.id === updated.id ? dbPatientToFrontend(result) : p)),
      )
      toast.success('Paciente actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar paciente')
    }
  }, [supabase])

  const deletePatientFn = useCallback(async (id: number) => {
    try {
      await svcDeletePatient(supabase, id)
      setPatients((prev) => prev.filter((p) => p.id !== id))
      toast.success('Paciente eliminado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar paciente')
    }
  }, [supabase])

  /* ── Transaction CRUD ──────────────────────────────── */

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id'>) => {
    try {
      const dbData = frontendTransactionToDb(data)
      const created = await svcCreateFinance(supabase, dbData)
      setTransactions((prev) => [dbFinanceToFrontend(created), ...prev])
      toast.success('Movimiento registrado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al registrar movimiento')
    }
  }, [supabase])

  const voidTransaction = useCallback(async (id: number) => {
    try {
      await svcVoidFinance(supabase, id)
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, anulado: true } : t)),
      )
      toast.success('Movimiento anulado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al anular movimiento')
    }
  }, [supabase])

  /* ── Value ─────────────────────────────────────────── */

  return (
    <DataContext.Provider
      value={{
        patients,
        setPatients,
        appointments,
        setAppointments,
        transactions,
        setTransactions,
        addPatient,
        updatePatient: updatePatientFn,
        deletePatient: deletePatientFn,
        addTransaction,
        voidTransaction,
        refresh: fetchAll,
        loading,
        error,
      }}
    >
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
