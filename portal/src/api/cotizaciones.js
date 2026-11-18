import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { borrar, ctx, elegir, limpiar, run, useMutacion } from './base.js'
import { diasHasta } from '../lib/format.js'

const CAMPOS = ['plan', 'semaforo', 'estado', 'resumen', 'documento_url', 'vigencia_hasta']

export const useCotizaciones = (oportunidadId) =>
  useQuery({
    queryKey: ['cotizaciones', { oportunidadId }],
    enabled: Boolean(oportunidadId),
    queryFn: () => run(supabase.from('cotizaciones').select('*').eq('oportunidad_id', oportunidadId).order('created_at', { ascending: false })),
  })

/** Cotizaciones enviadas que esperan respuesta del cliente, las que vencen antes primero. */
export const useCotizacionesEnviadas = () =>
  useQuery({
    queryKey: ['cotizaciones', 'enviadas'],
    queryFn: () =>
      run(
        supabase
          .from('cotizaciones')
          .select('*, cliente:clientes(id, nombre), oportunidad:oportunidades(id, titulo)')
          .eq('estado', 'enviada')
          .order('vigencia_hasta', { ascending: true })
          .limit(100),
      ),
  })

/** Crea o edita una cotización. Si no se indica número, la base asigna el siguiente (COT-AAAA-NNN). */
export const useGuardarCotizacion = () =>
  useMutacion(async ({ id, clienteId, oportunidadId, neto, mensual, ...valores }) => {
    const fila = { ...limpiar(elegir(valores, CAMPOS)), neto: Math.max(0, Number(neto) || 0), mensual: Math.max(0, Number(mensual) || 0) }
    if (id) return run(supabase.from('cotizaciones').update(fila).eq('id', id).select().single())
    return run(supabase.from('cotizaciones').insert({ organizacion_id: ctx.orgId, cliente_id: clienteId, oportunidad_id: oportunidadId, ...fila }).select().single())
  })

export const useCambiarEstadoCotizacion = () =>
  useMutacion(({ id, estado }) => run(supabase.from('cotizaciones').update({ estado }).eq('id', id)))

export const useEliminarCotizacion = () => useMutacion(({ id }) => borrar('cotizaciones', id))

export const IVA = 0.19
export const conIva = (neto) => Math.round(Number(neto) * (1 + IVA))

/** Estado "efectivo": una enviada cuya vigencia ya pasó se muestra como vencida. */
export function estadoEfectivo(c) {
  if (c.estado === 'enviada' && c.vigencia_hasta && diasHasta(c.vigencia_hasta) < 0) return 'vencida'
  return c.estado
}
