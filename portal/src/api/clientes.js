import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { borrar, ctx, elegir, limpiar, run, useMutacion } from './base.js'

const CAMPOS_CLIENTE = ['nombre', 'tipo', 'estado', 'rut', 'rubro', 'email', 'telefono', 'sitio_web', 'direccion', 'comuna', 'ciudad', 'notas']
const CAMPOS_CONTACTO = ['nombre', 'cargo', 'email', 'telefono', 'es_principal']

export const useClientes = () =>
  useQuery({
    queryKey: ['clientes'],
    queryFn: () =>
      run(
        supabase
          .from('clientes')
          .select('id, nombre, tipo, estado, rubro, email, telefono, created_at, contactos(nombre, es_principal), proyectos(id, estado), oportunidades(id, etapa)')
          .order('nombre'),
      ),
  })

export const useCliente = (id) =>
  useQuery({
    queryKey: ['cliente', id],
    enabled: Boolean(id),
    queryFn: () => run(supabase.from('clientes').select('*, contactos(*), proyectos(*), oportunidades(*)').eq('id', id).maybeSingle()),
  })

export const useGuardarCliente = () =>
  useMutacion(async ({ id, ...valores }) => {
    const fila = limpiar(elegir(valores, CAMPOS_CLIENTE))
    if (id) return run(supabase.from('clientes').update(fila).eq('id', id).select().single())
    return run(supabase.from('clientes').insert({ organizacion_id: ctx.orgId, ...fila }).select().single())
  })

export const useEliminarCliente = () => useMutacion(({ id }) => borrar('clientes', id))

export const useGuardarContacto = () =>
  useMutacion(async ({ id, clienteId, ...valores }) => {
    const fila = limpiar(elegir(valores, CAMPOS_CONTACTO))
    fila.es_principal = Boolean(valores.es_principal)
    // Solo un contacto principal por cliente.
    if (fila.es_principal) {
      await run(supabase.from('contactos').update({ es_principal: false }).eq('cliente_id', clienteId))
    }
    if (id) return run(supabase.from('contactos').update(fila).eq('id', id))
    return run(supabase.from('contactos').insert({ organizacion_id: ctx.orgId, cliente_id: clienteId, ...fila }))
  })

export const useEliminarContacto = () => useMutacion(({ id }) => borrar('contactos', id))

/** Contacto principal (o el primero) de un cliente, para mostrarlo en listas. */
export function contactoPrincipal(contactos = []) {
  return contactos.find((c) => c.es_principal) ?? contactos[0] ?? null
}
