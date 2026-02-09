export interface CIE10Entry {
  c: string
  d: string
  ch: string
}

let cache: CIE10Entry[] | null = null

export async function loadCIE10(): Promise<CIE10Entry[]> {
  if (cache) return cache
  const res = await fetch('/data/cie10-es.json')
  cache = await res.json()
  return cache!
}

export function searchCIE10(
  data: CIE10Entry[],
  query: string,
  limit = 20,
): CIE10Entry[] {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return data
    .filter(e => {
      const code = e.c.toLowerCase()
      const desc = e.d.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return code.startsWith(q) || code.includes(q) || desc.includes(q)
    })
    .slice(0, limit)
}
