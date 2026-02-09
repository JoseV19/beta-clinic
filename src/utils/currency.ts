export type Currency = 'USD' | 'GTQ'

export const EXCHANGE_RATE = 7.75

export const currencySymbol: Record<Currency, string> = {
  USD: '$',
  GTQ: 'Q',
}

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'GTQ') {
    const converted = amount * EXCHANGE_RATE
    return `Q${converted.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${amount.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount
  return from === 'USD' ? amount * EXCHANGE_RATE : amount / EXCHANGE_RATE
}

export const IVA_RATE = 0.12

export function calculateIVA(subtotal: number): number {
  return subtotal * IVA_RATE
}
