import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

/* ── Types ─────────────────────────────────────────────── */

export interface ClinicProfile {
  nombre: string
  direccion: string
  telefono: string
  nit: string
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
  appearance: AppearanceSettings
  setAppearance: React.Dispatch<React.SetStateAction<AppearanceSettings>>
  accentHex: string
  clearAllData: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [clinic, setClinic] = usePersistentState<ClinicProfile>('beta_clinic_profile', defaultProfile)
  const [appearance, setAppearance] = usePersistentState<AppearanceSettings>('beta_appearance', defaultAppearance)

  const accentHex = accentColorMap[appearance.accentColor] ?? accentColorMap.mint

  // Note: --color-accent is now driven by ClinicContext (specialty theme)

  // Apply reduced animations
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', appearance.reducedAnimations)
  }, [appearance.reducedAnimations])

  function clearAllData() {
    const keys = ['beta_patients', 'beta_appointments', 'beta_finance', 'beta_clinic_profile', 'beta_appearance']
    keys.forEach((k) => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <SettingsContext.Provider value={{ clinic, setClinic, appearance, setAppearance, accentHex, clearAllData }}>
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
