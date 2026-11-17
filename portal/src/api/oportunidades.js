import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { borrar, ctx, elegir, limpiar, run, useMutacion } from './base.js'
import { registrarActividad } from './actividades.js'
import { ETAPA } from '../lib/dominio.js'

const CAMPOS = ['titulo', 'servicio', 'valor', 'fecha_cierre_estimada', 'notas']

export const useOportunidades = () =>
  useQuery({
    queryKey: ['oportunidades'],
    queryFn: () =>
      run(supabase.from('oportunidades').select('*, cliente:clientes(id, nombre)').order('updated_at', { ascending: false })),
  })

export const useOportunidad = (id) =>
  useQuery({
    queryKey: ['oportunidad', id],
    enabled: Boolean(id),
    queryFn: () =>
      run(
        supabase
          .from('oportunidades')
          .select('*, cliente:clientes(id, nombre, email, telefono), proyectos(id, nombre, estado), lead:leads(id, pagina_origen, utm, created_at)')
          .eq('id', id)
          .maybeSingle(),
      ),
  })

function preparar(valores) {
  const fila = limpiar(elegir(valores, CAMPOS))
  if ('valor' in valores) fila.valor = Math.max(0, Number(valores.valor) || 0)
  return fila
}

/** Crea la oportunidad. Si no se indica `clienteId`, crea primero un cliente prospecto con los datos de `cliente`. */
export const useCrearOportunidad = () =>
  useMutacion(async ({ clienteId, cliente, nota, ...valores }) => {
    let idCliente = clienteId
    if (!idCliente) {
      const nuevo = await run(
        supabase
          .from('clientes')
          .insert({ organizacion_id: ctx.orgId, estado: 'prospecto', ...limpiar(elegir(cliente, ['nombre', 'email', 'telefono', 'tipo'])) })
          .select('id')
          .single(),
      )
      idCliente = nuevo.id
    }
    const oportunidad = await run(
      supabase
        .from('oportunidades')
        .insert({ organizacion_id: ctx.orgId, cliente_id: idCliente, responsable_id: ctx.userId, ...preparar(valores) })
        .select()
        .single(),
    )
    if (nota?.trim()) {
      await registrarActividad({ clienteId: idCliente, oportunidadId: oportunidad.id, tipo: 'nota', detalle: nota })
    }
    return oportunidad
  })

export const useActualizarOportunidad = () =>
  useMutacion(({ id, ...valores }) => run(supabase.from('oportunidades').update(preparar(valores)).eq('id', id).select().single()))

/** Cambia de etapa y deja el cambio en el historial del cliente. */
export const useMoverOportunidad = () =>
  useMutacion(async ({ oportunidad, etapa, motivo }) => {
    if (oportunidad.etapa === etapa) return oportunidad
    const cambios = { etapa, motivo_perdida: etapa === 'perdido' ? motivo?.trim() || null : null }
    const actualizada = await run(supabase.from('oportunidades').update(cambios).eq('id', oportunidad.id).select().single())
    await registrarActividad({
      clienteId: oportunidad.cliente_id,
      oportunidadId: oportunidad.id,
      tipo: 'etapa',
      detalle: `${ETAPA[oportunidad.etapa].label} → ${ETAPA[etapa].label}${etapa === 'perdido' && motivo?.trim() ? ` · Motivo: ${motivo.trim()}` : ''}`,
    })
    return actualizada
  })

export const useEliminarOportunidad = () => useMutacion(({ id }) => borrar('oportunidades', id))
