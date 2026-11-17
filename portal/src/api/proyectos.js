import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { borrar, ctx, elegir, limpiar, run, useMutacion } from './base.js'
import { registrarActividad } from './actividades.js'
import { ESTADO_PROYECTO } from '../lib/dominio.js'
import { hoyISO } from '../lib/format.js'

const CAMPOS = ['nombre', 'descripcion', 'servicio', 'estado', 'fecha_inicio', 'fecha_entrega', 'url']

export const useProyectos = () =>
  useQuery({
    queryKey: ['proyectos'],
    queryFn: () =>
      run(
        supabase
          .from('proyectos')
          .select('*, cliente:clientes(id, nombre), tareas(id, estado), cobros(id, monto, estado, fecha_vencimiento)')
          .order('created_at', { ascending: false }),
      ),
  })

export const useProyecto = (id) =>
  useQuery({
    queryKey: ['proyecto', id],
    enabled: Boolean(id),
    queryFn: () =>
      run(
        supabase
          .from('proyectos')
          .select('*, cliente:clientes(id, nombre, email, telefono), oportunidad:oportunidades(id, titulo)')
          .eq('id', id)
          .maybeSingle(),
      ),
  })

/** Avance según tareas completadas. Sin tareas: 0%, o 100% si ya se entregó. */
export function avanceProyecto(proyecto) {
  const tareas = proyecto.tareas ?? []
  if (!tareas.length) return proyecto.estado === 'entregado' ? 100 : 0
  return Math.round((tareas.filter((t) => t.estado === 'hecha').length / tareas.length) * 100)
}

export function resumenCobros(cobros = []) {
  const hoy = hoyISO()
  const total = cobros.reduce((s, c) => s + Number(c.monto), 0)
  const pagado = cobros.filter((c) => c.estado === 'pagado').reduce((s, c) => s + Number(c.monto), 0)
  const vencido = cobros
    .filter((c) => c.estado === 'pendiente' && c.fecha_vencimiento && c.fecha_vencimiento < hoy)
    .reduce((s, c) => s + Number(c.monto), 0)
  return { total, pagado, pendiente: total - pagado, vencido }
}

export const useGuardarProyecto = () =>
  useMutacion(async ({ id, clienteId, oportunidadId, entregado_at, monto, ...valores }) => {
    const fila = limpiar(elegir(valores, CAMPOS))
    fila.monto = Math.max(0, Number(monto) || 0)
    fila.estado = fila.estado || 'planificado'
    fila.entregado_at = fila.estado === 'entregado' ? entregado_at || hoyISO() : null

    if (id) return run(supabase.from('proyectos').update(fila).eq('id', id).select().single())

    const proyecto = await run(
      supabase
        .from('proyectos')
        .insert({ organizacion_id: ctx.orgId, cliente_id: clienteId, oportunidad_id: oportunidadId ?? null, responsable_id: ctx.userId, ...fila })
        .select()
        .single(),
    )
    await registrarActividad({ clienteId, proyectoId: proyecto.id, oportunidadId: oportunidadId ?? null, tipo: 'sistema', detalle: `Proyecto creado: ${proyecto.nombre}` })
    // Un prospecto que ya tiene proyecto pasa a cliente activo.
    await run(supabase.from('clientes').update({ estado: 'activo' }).eq('id', clienteId).eq('estado', 'prospecto'))
    return proyecto
  })

export const useCambiarEstadoProyecto = () =>
  useMutacion(async ({ proyecto, estado }) => {
    if (proyecto.estado === estado) return proyecto
    const actualizado = await run(
      supabase
        .from('proyectos')
        .update({ estado, entregado_at: estado === 'entregado' ? proyecto.entregado_at || hoyISO() : null })
        .eq('id', proyecto.id)
        .select()
        .single(),
    )
    await registrarActividad({
      clienteId: proyecto.cliente_id,
      proyectoId: proyecto.id,
      tipo: 'sistema',
      detalle: `Estado: ${ESTADO_PROYECTO[proyecto.estado].label} → ${ESTADO_PROYECTO[estado].label}`,
    })
    return actualizado
  })

export const useEliminarProyecto = () => useMutacion(({ id }) => borrar('proyectos', id))

/* ───────── Cobros (hitos de pago) ───────── */

export const useCobros = (proyectoId) =>
  useQuery({
    queryKey: ['cobros', proyectoId],
    enabled: Boolean(proyectoId),
    queryFn: () =>
      run(supabase.from('cobros').select('*').eq('proyecto_id', proyectoId).order('fecha_vencimiento', { ascending: true, nullsFirst: false })),
  })

export const useCobrosPendientes = () =>
  useQuery({
    queryKey: ['cobros', 'pendientes'],
    queryFn: () =>
      run(
        supabase
          .from('cobros')
          .select('*, proyecto:proyectos(id, nombre, cliente:clientes(id, nombre))')
          .eq('estado', 'pendiente')
          .order('fecha_vencimiento', { ascending: true, nullsFirst: false })
          .limit(200),
      ),
  })

export const useGuardarCobro = () =>
  useMutacion(async ({ id, proyectoId, concepto, monto, fecha_vencimiento, documento }) => {
    const fila = { ...limpiar({ concepto, fecha_vencimiento, documento }), monto: Math.max(1, Number(monto) || 0) }
    if (id) return run(supabase.from('cobros').update(fila).eq('id', id))
    return run(supabase.from('cobros').insert({ organizacion_id: ctx.orgId, proyecto_id: proyectoId, ...fila }))
  })

export const useMarcarCobro = () =>
  useMutacion(({ id, pagado }) =>
    run(supabase.from('cobros').update({ estado: pagado ? 'pagado' : 'pendiente', pagado_at: pagado ? hoyISO() : null }).eq('id', id)),
  )

export const useEliminarCobro = () => useMutacion(({ id }) => borrar('cobros', id))
