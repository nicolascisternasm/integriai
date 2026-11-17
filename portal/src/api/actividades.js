import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { ctx, run, useMutacion } from './base.js'

/** Filtra por el contexto más específico que se indique: proyecto > oportunidad > cliente. */
export function filtrarPorAmbito(consulta, ambito = {}) {
  if (ambito.proyectoId) return consulta.eq('proyecto_id', ambito.proyectoId)
  if (ambito.oportunidadId) return consulta.eq('oportunidad_id', ambito.oportunidadId)
  if (ambito.clienteId) return consulta.eq('cliente_id', ambito.clienteId)
  return consulta
}
export const hayAmbito = (a = {}) => Boolean(a.proyectoId || a.oportunidadId || a.clienteId)

export const useActividades = (ambito) =>
  useQuery({
    queryKey: ['actividades', ambito],
    enabled: hayAmbito(ambito),
    queryFn: () =>
      run(filtrarPorAmbito(supabase.from('actividades').select('*'), ambito).order('created_at', { ascending: false }).limit(200)),
  })

/** Registra una entrada en el historial del cliente (y opcionalmente de una oportunidad o proyecto). */
export function registrarActividad({ clienteId, oportunidadId = null, proyectoId = null, tipo = 'nota', detalle }) {
  return run(
    supabase.from('actividades').insert({
      organizacion_id: ctx.orgId,
      cliente_id: clienteId,
      oportunidad_id: oportunidadId,
      proyecto_id: proyectoId,
      tipo,
      detalle: detalle.trim(),
      usuario_nombre: ctx.nombre,
    }),
  )
}

export const useCrearActividad = () => useMutacion(registrarActividad)
