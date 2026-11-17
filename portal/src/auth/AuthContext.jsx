import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase.js'
import { fijarContexto } from '../api/base.js'

const AuthContext = createContext(null)

export function useAuth() {
  const valor = useContext(AuthContext)
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return valor
}

function mensajeAuth(error) {
  const texto = `${error?.code ?? ''} ${error?.message ?? ''}`.toLowerCase()
  if (texto.includes('invalid_credentials') || texto.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (texto.includes('email_not_confirmed') || texto.includes('not confirmed')) return 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.'
  if (error?.status === 429 || texto.includes('rate') || texto.includes('too many')) return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'
  if (texto.includes('same_password')) return 'La nueva contraseña debe ser distinta de la actual.'
  if (texto.includes('weak_password') || texto.includes('password should')) return 'La contraseña es muy débil. Usa al menos 8 caracteres.'
  if (texto.includes('failed to fetch') || texto.includes('network')) return 'No hay conexión con el servidor. Revisa tu internet.'
  return 'No pudimos completar la acción. Inténtalo de nuevo.'
}

// Una persona puede pertenecer a una organización (hoy una sola por usuario).
async function cargarPerfil(userId) {
  const { data, error } = await supabase
    .from('miembros')
    .select('rol, nombre, organizaciones(id, nombre, modulos, recibe_leads_web)')
    .eq('usuario_id', userId)
    .order('created_at')
    .limit(1)
  if (error) throw error
  const fila = data?.[0]
  if (!fila?.organizaciones) return null
  return { userId, rol: fila.rol, nombre: fila.nombre, org: fila.organizaciones }
}

export function AuthProvider({ children }) {
  const qc = useQueryClient()
  const [sesion, setSesion] = useState(undefined) // undefined = aún no sabemos
  const [perfil, setPerfil] = useState(undefined) // undefined = cargando · null = sin acceso
  const [errorPerfil, setErrorPerfil] = useState(null)
  const [version, setVersion] = useState(0)
  const [recuperando, setRecuperando] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session ?? null))
    const { data } = supabase.auth.onAuthStateChange((evento, nueva) => {
      setSesion(nueva ?? null)
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = sesion?.user?.id ?? null
  const sesionConocida = sesion !== undefined

  useEffect(() => {
    if (!sesionConocida) return undefined
    if (!userId) {
      fijarContexto({})
      setPerfil(undefined)
      qc.clear()
      return undefined
    }
    let cancelado = false
    setErrorPerfil(null)
    cargarPerfil(userId)
      .then((p) => {
        if (cancelado) return
        fijarContexto(p ? { orgId: p.org.id, userId, nombre: p.nombre } : {})
        setPerfil(p)
      })
      .catch((e) => {
        if (cancelado) return
        setErrorPerfil(e.message)
        setPerfil(null)
      })
    return () => {
      cancelado = true
    }
  }, [userId, sesionConocida, version, qc])

  const perfilVigente = perfil === undefined || perfil === null ? perfil : perfil.userId === userId ? perfil : undefined

  let estado
  if (!sesionConocida) estado = 'cargando'
  else if (!userId) estado = 'anonimo'
  else if (perfilVigente === undefined) estado = 'cargando'
  else if (perfilVigente === null) estado = 'sin_acceso'
  else estado = 'ok'

  const entrar = useCallback(async (email, clave) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: clave })
    if (error) throw new Error(mensajeAuth(error))
  }, [])

  const salir = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const recuperar = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}restablecer`,
    })
    if (error) throw new Error(mensajeAuth(error))
  }, [])

  const cambiarClave = useCallback(async (clave) => {
    const { error } = await supabase.auth.updateUser({ password: clave })
    if (error) throw new Error(mensajeAuth(error))
    setRecuperando(false)
  }, [])

  const recargarPerfil = useCallback(() => setVersion((v) => v + 1), [])

  const valor = useMemo(
    () => ({
      estado,
      sesion,
      user: sesion?.user ?? null,
      perfil: perfilVigente ?? null,
      org: perfilVigente?.org ?? null,
      rol: perfilVigente?.rol ?? null,
      esAdmin: ['propietario', 'admin'].includes(perfilVigente?.rol),
      errorPerfil,
      recuperando,
      entrar,
      salir,
      recuperar,
      cambiarClave,
      recargarPerfil,
    }),
    [estado, sesion, perfilVigente, errorPerfil, recuperando, entrar, salir, recuperar, cambiarClave, recargarPerfil],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
