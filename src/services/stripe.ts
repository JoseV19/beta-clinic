import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
    if (!key) {
      console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY no encontrado — modo demo activo')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

export function isStripeConfigured(): boolean {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
}

export async function createPaymentIntent(
  _amount: number,
  _currency: 'usd' | 'gtq',
): Promise<{ clientSecret: string }> {
  throw new Error(
    'Stripe backend no configurado. Se requiere un Edge Function para crear payment intents.',
  )
}
