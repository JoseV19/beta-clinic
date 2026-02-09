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
  dbAppointmentToFrontend,
} from '../services/mappers'
import {
  fetchPatients as svcFetchPatients,
  createPatient as svcCreatePatient,
  updatePatient as svcUpdatePatient,
  deletePatient as svcDeletePatient,
} from '../services/patientService'
import { fetchAppointments as svcFetchAppointments } from '../services/appointmentService'

/* ── Types ─────────────────────────────────────────────── */

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

  /* Async CRUD */
  addPatient: (data: Omit<Patient, 'id'>) => Promise<void>
  updatePatient: (updated: Patient) => Promise<void>
  deletePatient: (id: number) => Promise<void>
  refresh: () => Promise<void>

  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { supabase, profile, loading: authLoading } = useSupabase()

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ── Fetch all data ────────────────────────────────── */

  /* ── localStorage helpers ─────────────────────────────── */

  const LS_PATIENTS = 'beta_patients'
  const LS_APPOINTMENTS = 'beta_appointments'

  const loadFromLocalStorage = useCallback(() => {
    try {
      const p = localStorage.getItem(LS_PATIENTS)
      const a = localStorage.getItem(LS_APPOINTMENTS)
      if (p) setPatients(JSON.parse(p))
      if (a) setAppointments(JSON.parse(a))
    } catch { /* ignore parse errors */ }
  }, [])

  const saveToLocalStorage = useCallback((p: Patient[], a: Appointment[]) => {
    try {
      localStorage.setItem(LS_PATIENTS, JSON.stringify(p))
      localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(a))
    } catch { /* ignore quota errors */ }
  }, [])

  /* ── Fetch all data ────────────────────────────────── */

  const fetchAll = useCallback(async () => {
    if (!profile) return

    setLoading(true)
    setError(null)

    try {
      const [dbPatients, dbAppointments] = await Promise.all([
        svcFetchPatients(supabase),
        svcFetchAppointments(supabase),
      ])

      const frontendPatients = dbPatients.map(dbPatientToFrontend)
      const frontendAppts = dbAppointments.map(dbAppointmentToFrontend)
      setPatients(frontendPatients)
      setAppointments(frontendAppts)
      saveToLocalStorage(frontendPatients, frontendAppts)
    } catch {
      // Supabase unavailable → fallback to localStorage
      console.warn('[DataContext] Supabase unavailable, loading from localStorage')
      loadFromLocalStorage()
    } finally {
      setLoading(false)
    }
  }, [supabase, profile, saveToLocalStorage, loadFromLocalStorage])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setPatients([])
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

  /* ── Value ─────────────────────────────────────────── */

  return (
    <DataContext.Provider
      value={{
        patients,
        setPatients,
        appointments,
        setAppointments,
        addPatient,
        updatePatient: updatePatientFn,
        deletePatient: deletePatientFn,
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
