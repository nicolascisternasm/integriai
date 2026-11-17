import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { ctx, run, useMutacion } from './base.js'

/** Integrantes de la organización. Un miembro solo se ve a sí mismo; propietarios y administradores ven a todos. */
export const useEquipo = () =>
  useQuery({
    queryKey: ['equipo'],
    queryFn: () => run(supabase.from('miembros').select('usuario_id, rol, nombre, created_at').order('created_at')),
  })

export const useGuardarNombre = () =>
  useMutacion(({ nombre }) =>
    run(supabase.from('miembros').update({ nombre: nombre.trim() || null }).eq('usuario_id', ctx.userId).eq('organizacion_id', ctx.orgId)),
  )

export const useGuardarOrganizacion = () =>
  useMutacion(({ nombre }) => run(supabase.from('organizaciones').update({ nombre: nombre.trim() }).eq('id', ctx.orgId)))
