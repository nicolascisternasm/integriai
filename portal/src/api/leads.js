import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { ctx, run, useMutacion } from './base.js'

// Según cómo PostgREST detecte la relación, el resultado llega como lista o como objeto.
export const comoLista = (valor) => (Array.isArray(valor) ? valor : valor ? [valor] : [])

/**
 * Solicitudes del formulario de diagnóstico del sitio. Solo las ve la organización dueña del sitio
 * (`recibe_leads_web`); para las demás la consulta ni se ejecuta.
 */
export const useSolicitudes = (habilitado) =>
  useQuery({
    queryKey: ['solicitudes'],
    enabled: Boolean(habilitado),
    queryFn: async () => {
      const filas = await run(supabase.from('leads').select('*, oportunidades(id)').order('created_at', { ascending: false }).limit(300))
      return filas.map((l) => ({ ...l, convertida: comoLista(l.oportunidades).length > 0 }))
    },
  })

/** Crea cliente prospecto + contacto + oportunidad desde una solicitud (todo en una sola operación en la base). */
export const useConvertirSolicitud = () =>
  useMutacion((leadId) => run(supabase.rpc('convertir_lead', { p_lead: leadId, p_organizacion: ctx.orgId })))

export const useDescartarSolicitud = () =>
  useMutacion(({ id, nota }) => run(supabase.from('leads').update({ estado: 'perdido', ...(nota ? { notas: nota } : {}) }).eq('id', id)))
