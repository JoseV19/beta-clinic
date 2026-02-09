export type Currency = 'USD' | 'GTQ'

export interface PricingPlan {
  id: string
  name: string
  prices: Record<Currency, number>
  desc: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PLANS: PricingPlan[] = [
  {
    id: 'inicial',
    name: 'Inicial',
    prices: { USD: 19, GTQ: 150 },
    desc: 'Ideal para consultorios independientes que inician su digitalización.',
    features: [
      'Hasta 50 pacientes',
      'Agenda básica',
      'Expediente electrónico',
      'Soporte por email',
    ],
    cta: 'Empezar Gratis',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    prices: { USD: 39, GTQ: 300 },
    desc: 'Para prácticas en crecimiento que necesitan herramientas avanzadas.',
    features: [
      'Pacientes ilimitados',
      'Telemedicina integrada',
      'Reportes RIPS',
      'Recetas con PDF',
      'IA Gemini integrada',
      'Soporte prioritario',
    ],
    highlighted: true,
    cta: 'Prueba Gratis 14 días',
  },
  {
    id: 'clinica',
    name: 'Clínica',
    prices: { USD: 89, GTQ: 700 },
    desc: 'Solución completa para clínicas con múltiples profesionales.',
    features: [
      'Todo en Profesional',
      'Multi-doctor (hasta 15)',
      'Laboratorios avanzados',
      'Laboratorios y tendencias',
      'Directorio profesional',
      'Soporte dedicado 24/7',
    ],
    cta: 'Contactar Ventas',
  },
]

export const currencySymbol: Record<Currency, string> = { USD: '$', GTQ: 'Q' }

export function getPlanById(id: string): PricingPlan | undefined {
  return PLANS.find((p) => p.id === id)
}
