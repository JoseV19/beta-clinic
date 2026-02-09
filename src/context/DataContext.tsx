import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import { useSupabase } from './SupabaseContext'
import type { Patient } from '../data/patients'
import type { Invoice } from '../types/database'
import type {
  AgendaAppointment,
  Consultation,
  AppNotification,
} from '../types/phase2'
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

/* ── localStorage keys ────────────────────────────────── */

const LS_PATIENTS = 'beta_patients'
const LS_APPOINTMENTS = 'beta_appointments'
const LS_CONSULTATIONS = 'beta_consultations'
const LS_INVOICES = 'beta_invoices'
const LS_NOTIFICATIONS = 'beta_notifications'

/* ── localStorage helpers ────────────────────────────── */

function lsLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function lsSave<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch { /* ignore quota */ }
}

/* ── Context value type ──────────────────────────────── */

interface DataContextValue {
  /* Patients */
  patients: Patient[]
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>
  addPatient: (data: Omit<Patient, 'id'>) => Promise<void>
  updatePatient: (updated: Patient) => Promise<void>
  deletePatient: (id: number) => Promise<void>

  /* Agenda appointments */
  appointments: AgendaAppointment[]
  addAppointment: (data: Omit<AgendaAppointment, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateAppointment: (updated: AgendaAppointment) => void
  deleteAppointment: (id: number) => void

  /* Consultations */
  consultations: Consultation[]
  addConsultation: (data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateConsultation: (updated: Consultation) => void

  /* Invoices */
  invoices: Invoice[]
  addInvoice: (data: Omit<Invoice, 'id'>) => void
  updateInvoice: (updated: Invoice) => void

  /* Notifications */
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void

  /* Misc */
  refresh: () => Promise<void>
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextValue | null>(null)

/* ── Provider ────────────────────────────────────────── */

export function DataProvider({ children }: { children: ReactNode }) {
  const { supabase, profile, loading: authLoading } = useSupabase()

  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<AgendaAppointment[]>(() => lsLoad(LS_APPOINTMENTS, []))
  const [consultations, setConsultations] = useState<Consultation[]>(() => lsLoad(LS_CONSULTATIONS, []))
  const [invoices, setInvoices] = useState<Invoice[]>(() => lsLoad(LS_INVOICES, []))
  const [notifications, setNotifications] = useState<AppNotification[]>(() => lsLoad(LS_NOTIFICATIONS, []))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ── Persist to localStorage on change ─────────────── */

  useEffect(() => { lsSave(LS_APPOINTMENTS, appointments) }, [appointments])
  useEffect(() => { lsSave(LS_CONSULTATIONS, consultations) }, [consultations])
  useEffect(() => { lsSave(LS_INVOICES, invoices) }, [invoices])
  useEffect(() => { lsSave(LS_NOTIFICATIONS, notifications) }, [notifications])

  /* ── Fetch patients (Supabase → fallback LS) ───────── */

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
      setPatients(frontendPatients)
      lsSave(LS_PATIENTS, frontendPatients)

      // Map Supabase appointments into our old Appointment format — only for Dashboard backward compat
      // The AgendaAppointment[] state is managed separately via localStorage
      void dbAppointments.map(dbAppointmentToFrontend)
    } catch {
      console.warn('[DataContext] Supabase unavailable, loading from localStorage')
      setPatients(lsLoad(LS_PATIENTS, []))
    } finally {
      setLoading(false)
    }
  }, [supabase, profile])

  useEffect(() => {
    if (authLoading) return
    if (!profile) {
      setPatients([])
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
      setPatients((prev) => {
        const next = [dbPatientToFrontend(created), ...prev]
        lsSave(LS_PATIENTS, next)
        return next
      })
      toast.success('Paciente registrado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear paciente')
    }
  }, [supabase])

  const updatePatientFn = useCallback(async (updated: Patient) => {
    try {
      const dbData = frontendPatientToDb(updated)
      const result = await svcUpdatePatient(supabase, updated.id, dbData)
      setPatients((prev) => {
        const next = prev.map((p) => (p.id === updated.id ? dbPatientToFrontend(result) : p))
        lsSave(LS_PATIENTS, next)
        return next
      })
      toast.success('Paciente actualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar paciente')
    }
  }, [supabase])

  const deletePatientFn = useCallback(async (id: number) => {
    try {
      await svcDeletePatient(supabase, id)
      setPatients((prev) => {
        const next = prev.filter((p) => p.id !== id)
        lsSave(LS_PATIENTS, next)
        return next
      })
      toast.success('Paciente eliminado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar paciente')
    }
  }, [supabase])

  /* ── Agenda Appointment CRUD ───────────────────────── */

  const addAppointment = useCallback((data: Omit<AgendaAppointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setAppointments((prev) => {
      const id = prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1
      return [{ ...data, id, createdAt: now, updatedAt: now }, ...prev]
    })
  }, [])

  const updateAppointment = useCallback((updated: AgendaAppointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : a)),
    )
  }, [])

  const deleteAppointment = useCallback((id: number) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  /* ── Consultation CRUD ─────────────────────────────── */

  const addConsultation = useCallback((data: Omit<Consultation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    setConsultations((prev) => {
      const id = prev.length > 0 ? Math.max(...prev.map(c => c.id)) + 1 : 1
      return [{ ...data, id, createdAt: now, updatedAt: now }, ...prev]
    })
  }, [])

  const updateConsultation = useCallback((updated: Consultation) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c)),
    )
  }, [])

  /* ── Invoice CRUD ──────────────────────────────────── */

  const addInvoice = useCallback((data: Omit<Invoice, 'id'>) => {
    setInvoices((prev) => {
      const id = prev.length > 0 ? Math.max(...prev.map(i => i.id)) + 1 : 1
      return [{ ...data, id } as Invoice, ...prev]
    })
  }, [])

  const updateInvoice = useCallback((updated: Invoice) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i)),
    )
  }, [])

  /* ── Notification CRUD ─────────────────────────────── */

  const addNotification = useCallback((data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    setNotifications((prev) => [
      { ...data, id, read: false, createdAt: new Date().toISOString() },
      ...prev,
    ])
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  /* ── Context value ─────────────────────────────────── */

  return (
    <DataContext.Provider
      value={{
        patients,
        setPatients,
        addPatient,
        updatePatient: updatePatientFn,
        deletePatient: deletePatientFn,
        appointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        consultations,
        addConsultation,
        updateConsultation,
        invoices,
        addInvoice,
        updateInvoice,
        notifications,
        unreadCount,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
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
