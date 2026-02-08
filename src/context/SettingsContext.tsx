import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

/* ── Types ─────────────────────────────────────────────── */

export interface ClinicProfile {
  nombre: string
  direccion: string
  telefono: string
  nit: string
  logo?: string // base64 data-url
}

export interface DoctorProfile {
  nombre: string
  especialidad: string
  licencia: string
  avatar?: string // base64 data-url
}

export interface PrintSettings {
  accentColor: string // hex
  showLogo: boolean
  showDoctor: boolean
}

export type AccentColor = 'mint' | 'blue' | 'pink' | 'orange'

export interface AppearanceSettings {
  reducedAnimations: boolean
  accentColor: AccentColor
}

/* ── Defaults ──────────────────────────────────────────── */

const defaultProfile: ClinicProfile = {
  nombre: 'Beta Clinic',
  direccion: 'Calle 100 #15-20, Bogotá D.C., Colombia',
  telefono: '(601) 555-0100',
  nit: '900.123.456-7',
}

export const defaultDoctor: DoctorProfile = {
  nombre: 'Dr. Juan Pérez',
  especialidad: 'Medicina General',
  licencia: 'COL-12345',
}

export const defaultPrint: PrintSettings = {
  accentColor: '#7C3AED',
  showLogo: true,
  showDoctor: true,
}

const defaultAppearance: AppearanceSettings = {
  reducedAnimations: false,
  accentColor: 'mint',
}

// eslint-disable-next-line react-refresh/only-export-components
export const accentColorMap: Record<AccentColor, string> = {
  mint: '#7FFFD4',
  blue: '#60A5FA',
  pink: '#F472B6',
  orange: '#FB923C',
}

/* ── Context ──────────────────────────────────────────── */

interface SettingsContextValue {
  clinic: ClinicProfile
  setClinic: React.Dispatch<React.SetStateAction<ClinicProfile>>
  doctor: DoctorProfile
  setDoctor: React.Dispatch<React.SetStateAction<DoctorProfile>>
  printSettings: PrintSettings
  setPrintSettings: React.Dispatch<React.SetStateAction<PrintSettings>>
  appearance: AppearanceSettings
  setAppearance: React.Dispatch<React.SetStateAction<AppearanceSettings>>
  accentHex: string
  clearAllData: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [clinic, setClinic] = usePersistentState<ClinicProfile>('beta_clinic_profile', defaultProfile)
  const [doctor, setDoctor] = usePersistentState<DoctorProfile>('beta_doctor_profile', defaultDoctor)
  const [printSettings, setPrintSettings] = usePersistentState<PrintSettings>('beta_print_settings', defaultPrint)
  const [appearance, setAppearance] = usePersistentState<AppearanceSettings>('beta_appearance', defaultAppearance)

  const accentHex = accentColorMap[appearance.accentColor] ?? accentColorMap.mint

  // Note: --color-accent is now driven by ClinicContext (specialty theme)

  // Apply reduced animations
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', appearance.reducedAnimations)
  }, [appearance.reducedAnimations])

  function clearAllData() {
    const keys = ['beta_patients', 'beta_appointments', 'beta_finance', 'beta_clinic_profile', 'beta_appearance', 'beta_doctor_profile', 'beta_print_settings']
    keys.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <SettingsContext.Provider value={{ clinic, setClinic, doctor, setDoctor, printSettings, setPrintSettings, appearance, setAppearance, accentHex, clearAllData }}>
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
