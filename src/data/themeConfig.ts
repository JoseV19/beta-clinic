import type { ClinicType } from '../context/ClinicContext'

export const THEME_CONFIG: Record<ClinicType, { primary: string; accent: string; label: string }> = {
  general:    { primary: '#7C3AED', accent: '#7FFFD4', label: 'Medicina General' },
  dental:     { primary: '#0EA5E9', accent: '#22D3EE', label: 'Odontología' },
  pediatrics: { primary: '#F43F5E', accent: '#FBBF24', label: 'Pediatría' },
  nutrition:  { primary: '#10B981', accent: '#A3E635', label: 'Nutrición' },
}
