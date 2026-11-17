import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useEquipo, useGuardarNombre, useGuardarOrganizacion } from '../../api/equipo.js'
import { Avatar, Badge, Button, Campo, Card, Encabezado, Input } from '../../components/ui.jsx'
import { ROLES } from '../../lib/dominio.js'
import { fecha } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'
import { useTitulo } from '../../lib/useTitulo.js'
import { MODULES } from '../registry.js'

export default function ConfiguracionPage() {
  useTitulo('Configuración')
  const { user, perfil, org, rol, esAdmin, salir, cambiarClave, recargarPerfil } = useAuth()
  const { data: equipo = [] } = useEquipo()
  const guardarNombre = useGuardarNombre()
  const guardarOrg = useGuardarOrganizacion()
  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [nombreOrg, setNombreOrg] = useState(org.nombre)
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [errorClave, setErrorClave] = useState('')
  const [cambiando, setCambiando] = useState(false)

  async function actualizarClave(e) {
    e.preventDefault()
    setErrorClave('')
    if (clave.length < 8) return setErrorClave('Usa al menos 8 caracteres.')
    if (clave !== repetida) return setErrorClave('Las contraseñas no coinciden.')
    setCambiando(true)
    try {
      await cambiarClave(clave)
      toast.ok('Contraseña actualizada')
      setClave('')
      setRepetida('')
    } catch (err) {
      setErrorClave(err.message)
    } finally {
      setCambiando(false)
    }
  }

  const modulosActivos = MODULES.filter((m) => m.nucleo || org.modulos?.includes(m.id))

  return (
    <>
      <Encabezado titulo="Configuración" subtitulo="Tu cuenta y tu organización." />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Mi cuenta</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              guardarNombre.mutate({ nombre }, { onSuccess: () => { toast.ok('Nombre actualizado'); recargarPerfil() } })
            }}
          >
            <Campo label="Correo">
              <Input value={user?.email ?? ''} disabled readOnly />
            </Campo>
            <Campo label="Nombre" ayuda="Aparece en el historial de cada cliente.">
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={80} />
            </Campo>
            <div className="flex items-center justify-between gap-3">
              <Badge tono="violet">{ROLES[rol]}</Badge>
              <Button type="submit" variante="secundario" cargando={guardarNombre.isPending} disabled={nombre.trim() === (perfil?.nombre ?? '')}>
                Guardar nombre
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Cambiar contraseña</h2>
          <form onSubmit={actualizarClave} className="space-y-3">
            <Campo label="Nueva contraseña" ayuda="Mínimo 8 caracteres.">
              <Input type="password" autoComplete="new-password" value={clave} onChange={(e) => setClave(e.target.value)} />
            </Campo>
            <Campo label="Repite la contraseña">
              <Input type="password" autoComplete="new-password" value={repetida} onChange={(e) => setRepetida(e.target.value)} />
            </Campo>
            {errorClave && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
                {errorClave}
              </p>
            )}
            <div className="text-right">
              <Button type="submit" variante="secundario" cargando={cambiando} disabled={!clave}>
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Organización</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              guardarOrg.mutate({ nombre: nombreOrg }, { onSuccess: () => { toast.ok('Organización actualizada'); recargarPerfil() } })
            }}
          >
            <Campo label="Nombre" ayuda={esAdmin ? undefined : 'Solo propietarios y administradores pueden cambiarlo.'}>
              <Input value={nombreOrg} onChange={(e) => setNombreOrg(e.target.value)} disabled={!esAdmin} maxLength={120} />
            </Campo>
            {esAdmin && (
              <div className="text-right">
                <Button type="submit" variante="secundario" cargando={guardarOrg.isPending} disabled={nombreOrg.trim() === org.nombre || nombreOrg.trim().length < 2}>
                  Guardar
                </Button>
              </div>
            )}
          </form>
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-mute">Módulos activos</p>
            <div className="flex flex-wrap gap-1.5">
              {modulosActivos.map((m) => (
                <Badge key={m.id} tono="slate">
                  <m.icono className="size-3" aria-hidden /> {m.etiqueta}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-xs text-mute">¿Necesitas otro módulo (cotizaciones, inventario, facturación…)? Pídelo a IntegriAI.</p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-base font-bold">Equipo</h2>
          <ul className="divide-y divide-line">
            {equipo.map((m) => (
              <li key={m.usuario_id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <Avatar nombre={m.nombre || '?'} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {m.nombre || 'Sin nombre'}
                    {m.usuario_id === user?.id && <span className="font-normal text-mute"> (tú)</span>}
                  </p>
                  <p className="text-xs text-mute">Desde {fecha(m.created_at)}</p>
                </div>
                <Badge tono={m.rol === 'miembro' ? 'slate' : 'violet'}>{ROLES[m.rol]}</Badge>
              </li>
            ))}
          </ul>
          {!esAdmin && <p className="mt-3 text-xs text-mute">Solo ves tu propio acceso. Los administradores ven a todo el equipo.</p>}
          {esAdmin && <p className="mt-3 text-xs text-mute">Para sumar a alguien al equipo, pídele a IntegriAI que le habilite el acceso.</p>}
        </Card>
      </div>

      <div className="mt-6">
        <Button variante="secundario" icono={LogOut} onClick={salir}>
          Cerrar sesión
        </Button>
      </div>
    </>
  )
}
