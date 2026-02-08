import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* ── Env vars ──────────────────────────────────────────────────────────── */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.\n' +
    'Agrégalas en .env.local',
  )
}

/* ── Factory ───────────────────────────────────────────────────────────── */

/**
 * Crea un cliente Supabase que inyecta el token JWT de Clerk
 * en cada petición vía un `fetch` personalizado.
 *
 * Cada llamada a `getToken` obtiene un token fresco o cacheado
 * (Clerk lo maneja internamente), así que no hay riesgo de expiración.
 *
 * @param getToken — función que retorna el Clerk JWT para Supabase
 *                   e.g. `() => getToken({ template: 'supabase' })`
 */
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>,
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (input: RequestInfo | URL, init: RequestInit = {}) => {
        const clerkToken = await getToken()

        // Clone headers and inject Authorization
        const headers = new Headers(init.headers)
        if (clerkToken) {
          headers.set('Authorization', `Bearer ${clerkToken}`)
        }

        return fetch(input, { ...init, headers })
      },
    },
  })
}
