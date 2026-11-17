import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'

// Datos de la sesión actual. AuthContext los fija al cargar el perfil.
// Toda fila nueva lleva `organizacion_id`; la base verifica (RLS) que el usuario pertenezca a esa organización.
export const ctx = { orgId: null, userId: null, nombre: null }
export function fijarContexto(valores) {
  Object.assign(ctx, { orgId: null, userId: null, nombre: null }, valores)
}

class ErrorApi extends Error {
  constructor(error) {
    super(traducir(error))
    this.code = error.code
  }
}

function traducir(e) {
  switch (e.code) {
    case '23505':
      return 'Ya existe un registro con esos datos.'
    case '23503':
      return 'No se puede completar porque hay datos relacionados (por ejemplo, un cliente con proyectos no se puede eliminar).'
    case '23514':
      return 'Hay un dato inválido. Revisa el formulario.'
    case '42501':
    case 'PGRST116':
      return 'No tienes permiso para hacer esto, o el registro ya no existe.'
    default:
      return e.message || 'Ocurrió un error inesperado.'
  }
}

/** Ejecuta una consulta de Supabase y lanza un error legible si falla. */
export async function run(consulta) {
  const { data, error } = await consulta
  if (error) throw new ErrorApi(error)
  return data
}

/** Elimina por id. Con RLS, si no tienes permiso la base responde "0 filas" sin error: lo detectamos aquí. */
export async function borrar(tabla, id) {
  const filas = await run(supabase.from(tabla).delete().eq('id', id).select('id'))
  if (!filas?.length) throw new Error('No tienes permiso para eliminar esto, o ya no existe.')
}

/** Texto vacío -> null, y recorta espacios. */
export function limpiar(objeto) {
  const salida = {}
  for (const [clave, valor] of Object.entries(objeto)) {
    salida[clave] = typeof valor === 'string' ? valor.trim() || null : valor
  }
  return salida
}

export function elegir(objeto, claves) {
  const salida = {}
  for (const clave of claves) if (clave in objeto) salida[clave] = objeto[clave]
  return salida
}

/** Mutación que, al terminar, refresca todas las consultas (a esta escala es lo más simple y evita datos viejos). */
export function useMutacion(fn) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries(),
  })
}
