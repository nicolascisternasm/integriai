import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { FolderPlus, Globe, Mail, MessageCircle, Pencil, Phone, Plus, Star, Target, Trash2, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useCliente, useEliminarCliente, useEliminarContacto, useGuardarContacto } from '../../api/clientes.js'
import { useProyectos } from '../../api/proyectos.js'
import ClienteFormModal from '../../components/ClienteFormModal.jsx'
import OportunidadFormModal from '../../components/OportunidadFormModal.jsx'
import ProyectoFormModal from '../../components/ProyectoFormModal.jsx'
import TarjetaProyecto from '../../components/TarjetaProyecto.jsx'
import { ActividadPanel, TareasPanel } from '../../components/Paneles.jsx'
import {
  Avatar, Badge, BotonIcono, Button, Campo, Card, Cargando, Confirmar, Encabezado, ErrorCarga, Input, Modal, Pestanas, Vacio,
} from '../../components/ui.jsx'
import { ESTADO_CLIENTE, ETAPA, servicioLabel } from '../../lib/dominio.js'
import { clpCorto, enlaceWhatsApp, fecha } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'
import { useFormulario } from '../../lib/useFormulario.js'
import { useTitulo } from '../../lib/useTitulo.js'

export default function ClienteDetallePage() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { esAdmin } = useAuth()
  const { data: cliente, isLoading, error, refetch } = useCliente(id)
  const { data: proyectosTodos = [] } = useProyectos()
  const eliminar = useEliminarCliente()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'resumen'
  const cambiarTab = (t) => setParams(t === 'resumen' ? {} : { tab: t }, { replace: true })
  const [editando, setEditando] = useState(false)
  const [nuevoProyecto, setNuevoProyecto] = useState(false)
  const [nuevaOportunidad, setNuevaOportunidad] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  useTitulo(cliente?.nombre ?? 'Cliente')

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />
  if (!cliente) {
    return (
      <Vacio titulo="Cliente no encontrado" texto="Puede que haya sido eliminado.">
        <Link to="/clientes">
          <Button variante="secundario">Volver a clientes</Button>
        </Link>
      </Vacio>
    )
  }

  const estado = ESTADO_CLIENTE[cliente.estado]
  const proyectos = proyectosTodos.filter((p) => p.cliente_id === cliente.id)
  const oportunidades = [...(cliente.oportunidades ?? [])].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const wa = enlaceWhatsApp(cliente.telefono)
  const clienteRef = { id: cliente.id, nombre: cliente.nombre }

  return (
    <>
      <Encabezado atras={{ to: '/clientes', label: 'Clientes' }} titulo={cliente.nombre} subtitulo={[cliente.rubro, cliente.rut].filter(Boolean).join(' · ') || undefined}>
        <Badge tono={estado.tono}>{estado.label}</Badge>
        {cliente.email && (
          <a href={`mailto:${cliente.email}`}>
            <BotonIcono icono={Mail} etiqueta={`Escribir a ${cliente.email}`} variante="secundario" className="size-9 border border-line bg-white" />
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer">
            <BotonIcono icono={MessageCircle} etiqueta="Abrir WhatsApp" className="size-9 border border-line bg-white" />
          </a>
        )}
        <Button variante="secundario" icono={Pencil} onClick={() => setEditando(true)}>
          Editar
        </Button>
        <Button icono={FolderPlus} onClick={() => setNuevoProyecto(true)}>
          Nuevo proyecto
        </Button>
      </Encabezado>

      <Pestanas
        activa={tab}
        onCambiar={cambiarTab}
        pestanas={[
          { id: 'resumen', label: 'Resumen' },
          { id: 'proyectos', label: 'Proyectos', n: proyectos.length },
          { id: 'oportunidades', label: 'Oportunidades', n: oportunidades.length },
          { id: 'actividad', label: 'Historial' },
        ]}
      />

      {tab === 'resumen' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 text-base font-bold">Datos</h2>
              <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Dato titulo="Correo" valor={cliente.email} enlace={cliente.email && `mailto:${cliente.email}`} />
                <Dato titulo="Teléfono" valor={cliente.telefono} enlace={cliente.telefono && `tel:${cliente.telefono.replace(/\s/g, '')}`} />
                <Dato titulo="RUT" valor={cliente.rut} />
                <Dato titulo="Rubro" valor={cliente.rubro} />
                <Dato titulo="Sitio web" valor={cliente.sitio_web} enlace={cliente.sitio_web && (cliente.sitio_web.startsWith('http') ? cliente.sitio_web : `https://${cliente.sitio_web}`)} externo />
                <Dato titulo="Dirección" valor={[cliente.direccion, cliente.comuna, cliente.ciudad].filter(Boolean).join(', ')} />
                <Dato titulo="Cliente desde" valor={fecha(cliente.created_at)} />
              </dl>
            </Card>

            <Contactos cliente={cliente} />

            {cliente.notas && (
              <Card className="p-5">
                <h2 className="mb-2 text-base font-bold">Notas internas</h2>
                <p className="whitespace-pre-wrap break-words text-sm text-ink-2">{cliente.notas}</p>
              </Card>
            )}

            {esAdmin && (
              <div className="pt-1">
                <Button variante="peligro-suave" icono={Trash2} onClick={() => setConfirmando(true)}>
                  Eliminar cliente
                </Button>
              </div>
            )}
          </div>

          <Card className="h-fit p-5">
            <h2 className="mb-3 text-base font-bold">Próximos pasos</h2>
            <TareasPanel ambito={{ clienteId: cliente.id }} placeholder="Ej: Llamar para agendar reunión" textoVacio="Sin tareas pendientes con este cliente." />
          </Card>
        </div>
      )}

      {tab === 'proyectos' &&
        (proyectos.length === 0 ? (
          <Card>
            <Vacio icono={FolderPlus} titulo="Sin proyectos" texto="Cuando cierres una venta, crea aquí el proyecto para seguir tareas, avance y cobros.">
              <Button icono={Plus} onClick={() => setNuevoProyecto(true)}>
                Nuevo proyecto
              </Button>
            </Vacio>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {proyectos.map((p) => (
              <TarjetaProyecto key={p.id} proyecto={p} mostrarCliente={false} />
            ))}
          </div>
        ))}

      {tab === 'oportunidades' && (
        <Card>
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-base font-bold">Oportunidades</h2>
            <Button tamano="sm" variante="secundario" icono={Plus} onClick={() => setNuevaOportunidad(true)}>
              Nueva
            </Button>
          </div>
          {oportunidades.length === 0 ? (
            <Vacio icono={Target} titulo="Sin oportunidades" texto="Una oportunidad es una posible venta que sigues por el embudo." />
          ) : (
            <ul className="divide-y divide-line">
              {oportunidades.map((o) => (
                <li key={o.id}>
                  <Link to={`/crm/oportunidades/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-paper/60">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{o.titulo}</p>
                      <p className="text-xs text-mute">
                        {servicioLabel(o.servicio)} · actualizada {fecha(o.updated_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{clpCorto(o.valor)}</span>
                      <Badge tono={ETAPA[o.etapa].tono}>{ETAPA[o.etapa].label}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'actividad' && (
        <Card className="max-w-3xl p-5">
          <ActividadPanel ambito={{ clienteId: cliente.id }} clienteId={cliente.id} />
        </Card>
      )}

      <ClienteFormModal abierto={editando} onCerrar={() => setEditando(false)} cliente={cliente} />
      <ProyectoFormModal abierto={nuevoProyecto} onCerrar={() => setNuevoProyecto(false)} clienteFijo={clienteRef} onGuardado={(p) => navegar(`/proyectos/${p.id}`)} />
      <OportunidadFormModal abierto={nuevaOportunidad} onCerrar={() => setNuevaOportunidad(false)} clienteFijo={clienteRef} onGuardado={(o) => navegar(`/crm/oportunidades/${o.id}`)} />
      <Confirmar
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo="¿Eliminar este cliente?"
        texto={`Se borrarán también sus contactos, oportunidades, tareas e historial. Un cliente con proyectos no se puede eliminar. Esta acción no se puede deshacer.`}
        cargando={eliminar.isPending}
        onConfirmar={() =>
          eliminar.mutate(
            { id: cliente.id },
            {
              onSuccess: () => {
                toast.ok('Cliente eliminado')
                navegar('/clientes', { replace: true })
              },
              onSettled: () => setConfirmando(false),
            },
          )
        }
      />
    </>
  )
}

function Dato({ titulo, valor, enlace, externo }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-mute">{titulo}</dt>
      <dd className="mt-0.5 break-words">
        {!valor ? (
          <span className="text-mute">—</span>
        ) : enlace ? (
          <a href={enlace} className="font-medium text-acc hover:underline" {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {valor}
          </a>
        ) : (
          valor
        )}
      </dd>
    </div>
  )
}

/* ───────── Contactos ───────── */

function Contactos({ cliente }) {
  const eliminar = useEliminarContacto()
  const [editando, setEditando] = useState(null) // null = cerrado · {} = nuevo · contacto = editar
  const contactos = [...(cliente.contactos ?? [])].sort((a, b) => Number(b.es_principal) - Number(a.es_principal))

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">Contactos</h2>
        <Button tamano="sm" variante="secundario" icono={UserPlus} onClick={() => setEditando({})}>
          Agregar
        </Button>
      </div>
      {contactos.length === 0 ? (
        <p className="text-sm text-mute">Aún no hay personas de contacto registradas.</p>
      ) : (
        <ul className="divide-y divide-line">
          {contactos.map((c) => (
            <li key={c.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <Avatar nombre={c.nombre} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {c.nombre}
                  {c.es_principal && (
                    <Badge tono="violet">
                      <Star className="size-3" aria-hidden /> Principal
                    </Badge>
                  )}
                </p>
                {c.cargo && <p className="text-xs text-mute">{c.cargo}</p>}
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1 text-acc hover:underline">
                      <Mail className="size-3.5" aria-hidden /> {c.email}
                    </a>
                  )}
                  {c.telefono && (
                    <a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 text-acc hover:underline">
                      <Phone className="size-3.5" aria-hidden /> {c.telefono}
                    </a>
                  )}
                </p>
              </div>
              <BotonIcono icono={Pencil} etiqueta={`Editar a ${c.nombre}`} onClick={() => setEditando(c)} />
              <BotonIcono icono={Trash2} etiqueta={`Eliminar a ${c.nombre}`} variante="peligro" onClick={() => eliminar.mutate({ id: c.id })} />
            </li>
          ))}
        </ul>
      )}
      <FormularioContacto contacto={editando} clienteId={cliente.id} esPrimero={contactos.length === 0} onCerrar={() => setEditando(null)} />
    </Card>
  )
}

function FormularioContacto({ contacto, ...props }) {
  return contacto ? <ContactoInterno contacto={contacto} {...props} /> : null
}

function ContactoInterno({ contacto, clienteId, esPrimero, onCerrar }) {
  const guardar = useGuardarContacto()
  const [v, campo] = useFormulario({
    nombre: contacto.nombre ?? '',
    cargo: contacto.cargo ?? '',
    email: contacto.email ?? '',
    telefono: contacto.telefono ?? '',
    es_principal: contacto.id ? contacto.es_principal : esPrimero,
  })
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={contacto.id ? 'Editar contacto' : 'Nuevo contacto'}
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-contacto" cargando={guardar.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="form-contacto"
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          guardar.mutate({ id: contacto.id, clienteId, ...v }, { onSuccess: () => { toast.ok('Contacto guardado'); onCerrar() } })
        }}
      >
        <Campo label="Nombre" requerido>
          <Input {...campo('nombre')} required autoFocus maxLength={160} />
        </Campo>
        <Campo label="Cargo">
          <Input {...campo('cargo')} placeholder="Gerente, administrador…" />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Correo">
            <Input type="email" {...campo('email')} />
          </Campo>
          <Campo label="Teléfono / WhatsApp">
            <Input type="tel" {...campo('telefono')} />
          </Campo>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-[var(--color-acc)]" checked={Boolean(v.es_principal)} onChange={campo('es_principal').onChange} />
          Es el contacto principal
        </label>
      </form>
    </Modal>
  )
}
