import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { THEME_CONFIG } from '../data/themeConfig'
import { useTheme } from './ThemeContext'

/* ── Types ─────────────────────────────────────────────── */

export type ClinicType = 'general' | 'dental' | 'pediatrics' | 'nutrition'

export interface ClinicContextValue {
  clinicType: ClinicType | null
  setClinicType: (type: ClinicType) => void
  isOnboarded: boolean
}

/* ── Context ───────────────────────────────────────────── */

const ClinicCtx = createContext<ClinicContextValue | undefined>(undefined)

/* ── Monochrome palettes ──────────────────────────────── */

const MONO_PALETTE = {
  dark: { primary: '#9CA3AF', accent: '#E5E7EB' },
  light: { primary: '#1F2937', accent: '#111827' },
} as const

/* ── Provider ──────────────────────────────────────────── */

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinicType, setClinicType] = usePersistentState<ClinicType | null>(
    'beta_clinic_type',
    null,
  )
  const { monochrome, theme } = useTheme()

  // Inject specialty theme CSS variables
  useEffect(() => {
    if (monochrome) {
      const palette = MONO_PALETTE[theme]
      document.documentElement.style.setProperty('--color-primary', palette.primary)
      document.documentElement.style.setProperty('--color-accent', palette.accent)
    } else {
      const palette = THEME_CONFIG[clinicType ?? 'general']
      document.documentElement.style.setProperty('--color-primary', palette.primary)
      document.documentElement.style.setProperty('--color-accent', palette.accent)
    }
  }, [clinicType, monochrome, theme])

  const value: ClinicContextValue = {
    clinicType,
    setClinicType: (type: ClinicType) => setClinicType(type),
    isOnboarded: clinicType !== null,
  }

  return <ClinicCtx.Provider value={value}>{children}</ClinicCtx.Provider>
}

/* ── Hook ──────────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export function useClinic() {
  const ctx = useContext(ClinicCtx)
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider')
  return ctx
}
