import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { borrar, ctx, run, useMutacion } from './base.js'
import { filtrarPorAmbito, hayAmbito } from './actividades.js'

export const useTareas = (ambito) =>
  useQuery({
    queryKey: ['tareas', ambito],
    enabled: hayAmbito(ambito),
    queryFn: () => {
      let consulta = filtrarPorAmbito(supabase.from('tareas').select('*'), ambito)
      // En la ficha de un cliente se ven sus seguimientos comerciales; las tareas internas de un proyecto viven en el proyecto.
      if (!ambito.proyectoId && !ambito.oportunidadId) consulta = consulta.is('proyecto_id', null)
      return run(consulta.order('created_at'))
    },
  })

/** Todas las tareas abiertas de la organización, con el nombre de lo que las origina. */
export const useTareasPendientes = () =>
  useQuery({
    queryKey: ['tareas', 'pendientes'],
    queryFn: () =>
      run(
        supabase
          .from('tareas')
          .select('*, cliente:clientes(id, nombre), oportunidad:oportunidades(id, titulo), proyecto:proyectos(id, nombre)')
          .neq('estado', 'hecha')
          .order('fecha_limite', { ascending: true, nullsFirst: false })
          .limit(300),
      ),
  })

export const useCrearTarea = () =>
  useMutacion(({ titulo, fecha, clienteId, oportunidadId, proyectoId }) =>
    run(
      supabase.from('tareas').insert({
        organizacion_id: ctx.orgId,
        titulo: titulo.trim(),
        fecha_limite: fecha || null,
        cliente_id: clienteId ?? null,
        oportunidad_id: oportunidadId ?? null,
        proyecto_id: proyectoId ?? null,
        responsable_id: ctx.userId,
      }),
    ),
  )

export const useCambiarTarea = () =>
  useMutacion(({ id, estado }) =>
    run(
      supabase
        .from('tareas')
        .update({ estado, completada_at: estado === 'hecha' ? new Date().toISOString() : null })
        .eq('id', id),
    ),
  )

export const useEliminarTarea = () => useMutacion(({ id }) => borrar('tareas', id))
