import {
  Stethoscope,
  SmilePlus,
  Baby,
  Apple,
} from 'lucide-react'

/* ── Types ────────────────────────────────────────────────── */

export type SpecialtyKey = 'general' | 'dental' | 'pediatrics' | 'nutrition'

export interface SpecialtyConfig {
  key: SpecialtyKey
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  color: string
  accent: string
  emoji: string
  motivos: string[]
  doctor: string
}

export interface DayInfo {
  iso: string
  dayNum: string
  dayName: string
  monthLabel: string
  fullLabel: string
}

/* ── Specialty data ───────────────────────────────────────── */

export const SPECIALTY_DATA: SpecialtyConfig[] = [
  {
    key: 'general',
    label: 'Medicina General',
    icon: Stethoscope,
    color: '#7C3AED',
    accent: '#7FFFD4',
    emoji: '🩺',
    motivos: ['Consulta General', 'Certificado Médico', 'Revisión de Exámenes', 'Control de Presión'],
    doctor: 'Dr. Rodríguez',
  },
  {
    key: 'dental',
    label: 'Odontología',
    icon: SmilePlus,
    color: '#0EA5E9',
    accent: '#22D3EE',
    emoji: '🦷',
    motivos: ['Limpieza Dental', 'Dolor de Muelas', 'Ortodoncia', 'Blanqueamiento', 'Extracción'],
    doctor: 'Dra. Martínez',
  },
  {
    key: 'pediatrics',
    label: 'Pediatría',
    icon: Baby,
    color: '#F43F5E',
    accent: '#FBBF24',
    emoji: '👶',
    motivos: ['Control Niño Sano', 'Vacunación', 'Enfermedad / Urgencia', 'Control de Crecimiento'],
    doctor: 'Dra. López',
  },
  {
    key: 'nutrition',
    label: 'Nutrición',
    icon: Apple,
    color: '#10B981',
    accent: '#A3E635',
    emoji: '🥗',
    motivos: ['Primera Vez', 'Control de Peso', 'Plan Deportivo', 'Plan para Embarazo'],
    doctor: 'Lic. Herrera',
  },
]

/* ── Time slots ───────────────────────────────────────────── */

export const ALL_SLOTS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '14:00 PM', '14:30 PM', '15:00 PM', '15:30 PM',
  '16:00 PM', '16:30 PM',
]

export function getOccupied(dateIso: string): Set<string> {
  const seed = dateIso.split('-').reduce((a, b) => a + Number(b), 0)
  const set = new Set<string>()
  ALL_SLOTS.forEach((s, i) => {
    if ((seed * (i + 3)) % 5 === 0) set.add(s)
  })
  return set
}

/* ── Date helpers ─────────────────────────────────────────── */

export function getNext14Days(): DayInfo[] {
  const days: DayInfo[] = []
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      iso: d.toISOString().split('T')[0],
      dayNum: d.getDate().toString(),
      dayName: d.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
      monthLabel: d.toLocaleDateString('es', { month: 'short' }).replace('.', ''),
      fullLabel: d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' }),
    })
  }
  return days
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
