import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Lock, SearchX } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { moduloDisponible } from '../modules/registry.js'
import { Button, Card, PantallaCarga, Vacio } from '../components/ui.jsx'

/** Solo pasa quien inició sesión y pertenece a una organización. */
export function RequireAuth() {
  const { estado } = useAuth()
  const ubicacion = useLocation()
  if (estado === 'cargando') return <PantallaCarga />
  if (estado === 'anonimo') {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname + ubicacion.search }} />
  }
  if (estado === 'sin_acceso') return <SinAcceso />
  return <Outlet />
}

/** Solo pasa si el módulo está activo para la organización y el rol lo permite. */
export function RequireModulo({ modulo, children }) {
  const { org, esAdmin } = useAuth()
  if (!moduloDisponible(modulo, org, esAdmin)) return <NoDisponible />
  return children
}

function SinAcceso() {
  const { user, salir, errorPerfil } = useAuth()
  return (
    <div className="grid min-h-dvh place-items-center bg-paper p-6">
      <Card className="w-full max-w-md p-8 text-center">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-amber-50 text-amber-700">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">Tu cuenta aún no tiene acceso</h1>
        <p className="mt-2 text-sm text-mute">
          Iniciaste sesión como <b className="text-ink">{user?.email}</b>, pero esta cuenta todavía no está asociada a ninguna organización del portal.
          Pide a IntegriAI que te habilite.
        </p>
        {errorPerfil && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{errorPerfil}</p>}
        <Button variante="secundario" className="mt-6" onClick={salir}>
          Cerrar sesión
        </Button>
      </Card>
    </div>
  )
}

export function NoDisponible() {
  return (
    <Vacio icono={Lock} titulo="Este módulo no está disponible" texto="No está activo para tu organización o tu rol no tiene acceso.">
      <Link to="/">
        <Button variante="secundario">Volver al inicio</Button>
      </Link>
    </Vacio>
  )
}

export function NoEncontrada() {
  return (
    <Vacio icono={SearchX} titulo="Página no encontrada" texto="La dirección no existe o fue movida.">
      <Link to="/">
        <Button variante="secundario">Volver al inicio</Button>
      </Link>
    </Vacio>
  )
}
