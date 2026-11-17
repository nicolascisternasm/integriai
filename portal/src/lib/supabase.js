import { createClient } from '@supabase/supabase-js'

// La clave publicable es pública por diseño (ya está en el sitio). Lo que protege los datos es la seguridad
// a nivel de fila (RLS) de la base: sin una fila en `miembros`, esta clave no ve nada.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uhgqtrsxszydcvhanmew.supabase.co'
export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_nDJgbK64ZT8j0tD_cSNDvA_4ll-VvIW'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'integriai-portal-auth',
  },
})
