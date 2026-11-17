import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Banknote, CalendarClock, ExternalLink, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import {
  avanceProyecto, resumenCobros, useCambiarEstadoProyecto, useCobros, useEliminarCobro, useEliminarProyecto,
  useGuardarCobro, useMarcarCobro, useProyecto,
} from '../../api/proyectos.js'
import { useTareas } from '../../api/tareas.js'
import ProyectoFormModal from '../../components/ProyectoFormModal.jsx'
import { ActividadPanel, ChipPlazo, TareasPanel } from '../../components/Paneles.jsx'
import {
  Badge, BotonIcono, Button, Barra, Campo, Card, Cargando, Confirmar, Encabezado, ErrorCarga, Input, Modal, Pestanas, Select, Vacio,
} from '../../components/ui.jsx'
import { ESTADOS_PROYECTO, ESTADO_PROYECTO, servicioLabel } from '../../lib/dominio.js'
import { clp, diasHasta, fecha, fechaCorta } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'
import { useFormulario } from '../../lib/useFormulario.js'
import { useTitulo } from '../../lib/useTitulo.js'

export default function ProyectoDetallePage() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { esAdmin } = useAuth()
  const { data: proyecto, isLoading, error, refetch } = useProyecto(id)
  const { data: tareas = [] } = useTareas({ proyectoId: id })
  const { data: cobros = [] } = useCobros(id)
  const cambiarEstado = useCambiarEstadoProyecto()
  const eliminar = useEliminarProyecto()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'resumen'
  const cambiarTab = (t) => setParams(t === 'resumen' ? {} : { tab: t }, { replace: true })
  const [editando, setEditando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  useTitulo(proyecto?.nombre ?? 'Proyecto')

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />
  if (!proyecto) {
    return (
      <Vacio titulo="Proyecto no encontrado" texto="Puede que haya sido eliminado.">
        <Link to="/proyectos">
          <Button variante="secundario">Volver a proyectos</Button>
        </Link>
      </Vacio>
    )
  }

  const estado = ESTADO_PROYECTO[proyecto.estado]
  const avance = avanceProyecto({ ...proyecto, tareas })
  const dinero = resumenCobros(cobros)
  const abierto = !['entregado', 'cancelado'].includes(proyecto.estado)
  const atrasado = abierto && proyecto.fecha_entrega && diasHasta(proyecto.fecha_entrega) < 0
  const hechas = tareas.filter((t) => t.estado === 'hecha').length
  const sinProgramar = Math.max(0, Number(proyecto.monto) - dinero.total)

  return (
    <>
      <Encabezado
        atras={{ to: '/proyectos', label: 'Proyectos' }}
        titulo={proyecto.nombre}
        subtitulo={
          <>
            <Link to={`/clientes/${proyecto.cliente.id}`} className="font-semibold text-acc hover:underline">
              {proyecto.cliente.nombre}
            </Link>{' '}
            · {servicioLabel(proyecto.servicio)}
          </>
        }
      >
        <Select
          value={proyecto.estado}
          onChange={(e) => cambiarEstado.mutate({ proyecto, estado: e.target.value })}
          className="w-auto font-semibold"
          aria-label="Estado del proyecto"
        >
          {ESTADOS_PROYECTO.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </Select>
        <Button variante="secundario" icono={Pencil} onClick={() => setEditando(true)}>
          Editar
        </Button>
      </Encabezado>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Card className="col-span-2 p-4 lg:col-span-2">
          <p className="text-[13px] font-semibold text-mute">Avance</p>
          <p className="mt-1 font-display text-2xl font-bold">{avance}%</p>
          <Barra valor={avance} className="mt-2" />
          <p className="mt-1.5 text-xs text-mute">
            {tareas.length ? `${hechas} de ${tareas.length} tareas completadas` : 'Agrega tareas para medir el avance'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-semibold text-mute">Monto</p>
          <p className="mt-1 font-display text-2xl font-bold">{clp(proyecto.monto)}</p>
          <p className="mt-0.5 text-xs text-mute">cobrado {clp(dinero.pagado)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[13px] font-semibold text-mute">Por cobrar</p>
          <p className={`mt-1 font-display text-2xl font-bold ${dinero.vencido > 0 ? 'text-red-600' : ''}`}>{clp(dinero.pendiente)}</p>
          <p className={`mt-0.5 text-xs ${dinero.vencido > 0 ? 'font-semibold text-red-600' : 'text-mute'}`}>
            {dinero.vencido > 0 ? `${clp(dinero.vencido)} vencido` : 'sin vencidos'}
          </p>
        </Card>
        <Card className="col-span-2 p-4 lg:col-span-1">
          <p className="text-[13px] font-semibold text-mute">{proyecto.estado === 'entregado' ? 'Entregado' : 'Entrega'}</p>
          <p className="mt-1 font-display text-2xl font-bold">{fechaCorta(proyecto.entregado_at || proyecto.fecha_entrega)}</p>
          {atrasado && <Badge tono="red" className="mt-1.5">Atrasado {Math.abs(diasHasta(proyecto.fecha_entrega))} d</Badge>}
        </Card>
      </div>

      <Pestanas
        activa={tab}
        onCambiar={cambiarTab}
        pestanas={[
          { id: 'resumen', label: 'Resumen' },
          { id: 'tareas', label: 'Tareas', n: tareas.length - hechas },
          { id: 'cobros', label: 'Cobros', n: cobros.filter((c) => c.estado === 'pendiente').length },
          { id: 'bitacora', label: 'Bitácora' },
        ]}
      />

      {tab === 'resumen' && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-bold">Alcance y detalles</h2>
            {proyecto.descripcion ? (
              <p className="whitespace-pre-wrap break-words text-sm text-ink-2">{proyecto.descripcion}</p>
            ) : (
              <p className="text-sm text-mute">Sin descripción. Edita el proyecto para registrar el alcance, entregables y acuerdos.</p>
            )}
            <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
              <Fila titulo="Estado" valor={<Badge tono={estado.tono}>{estado.label}</Badge>} />
              <Fila titulo="Servicio" valor={servicioLabel(proyecto.servicio)} />
              <Fila titulo="Inicio" valor={fecha(proyecto.fecha_inicio)} />
              <Fila titulo="Entrega estimada" valor={fecha(proyecto.fecha_entrega)} />
              {proyecto.entregado_at && <Fila titulo="Entregado el" valor={fecha(proyecto.entregado_at)} />}
              {proyecto.url && (
                <Fila
                  titulo="Enlace"
                  valor={
                    <a href={proyecto.url.startsWith('http') ? proyecto.url : `https://${proyecto.url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-acc hover:underline">
                      Abrir <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                  }
                />
              )}
              {proyecto.oportunidad && (
                <Fila
                  titulo="Nació de"
                  valor={
                    <Link to={`/crm/oportunidades/${proyecto.oportunidad.id}`} className="inline-flex items-center gap-1 font-medium text-acc hover:underline">
                      <Target className="size-3.5" aria-hidden /> {proyecto.oportunidad.titulo}
                    </Link>
                  }
                />
              )}
            </dl>
            {esAdmin && (
              <div className="mt-5 border-t border-line pt-4">
                <Button variante="peligro-suave" icono={Trash2} onClick={() => setConfirmando(true)}>
                  Eliminar proyecto
                </Button>
              </div>
            )}
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-3 text-base font-bold">Tareas abiertas</h2>
              {tareas.filter((t) => t.estado !== 'hecha').length === 0 ? (
                <p className="text-sm text-mute">No hay tareas abiertas.</p>
              ) : (
                <ul className="space-y-2">
                  {tareas
                    .filter((t) => t.estado !== 'hecha')
                    .slice(0, 6)
                    .map((t) => (
                      <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                        <span className="min-w-0 break-words">{t.titulo}</span>
                        <ChipPlazo tarea={t} />
                      </li>
                    ))}
                </ul>
              )}
              <Button variante="fantasma" tamano="sm" className="mt-3" onClick={() => cambiarTab('tareas')}>
                Ver todas las tareas
              </Button>
            </Card>
            <Card className="p-5">
              <h2 className="mb-3 text-base font-bold">Próximos cobros</h2>
              {cobros.filter((c) => c.estado === 'pendiente').length === 0 ? (
                <p className="text-sm text-mute">{cobros.length ? 'Todo cobrado.' : 'Aún no hay cobros programados.'}</p>
              ) : (
                <ul className="space-y-2">
                  {cobros
                    .filter((c) => c.estado === 'pendiente')
                    .slice(0, 4)
                    .map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate">{c.concepto}</span>
                        <span className="shrink-0 font-semibold">{clp(c.monto)}</span>
                      </li>
                    ))}
                </ul>
              )}
              <Button variante="fantasma" tamano="sm" className="mt-3" onClick={() => cambiarTab('cobros')}>
                Ver cobros
              </Button>
            </Card>
          </div>
        </div>
      )}

      {tab === 'tareas' && (
        <Card className="max-w-3xl p-5">
          <TareasPanel
            ambito={{ proyectoId: proyecto.id, clienteId: proyecto.cliente_id }}
            ciclo="proyecto"
            placeholder="Ej: Diseñar la base de datos"
            textoVacio="Divide el proyecto en tareas para medir el avance. Toca el círculo para marcar su progreso."
          />
        </Card>
      )}

      {tab === 'cobros' && <Cobros proyecto={proyecto} cobros={cobros} sinProgramar={sinProgramar} dinero={dinero} />}

      {tab === 'bitacora' && (
        <Card className="max-w-3xl p-5">
          <ActividadPanel ambito={{ proyectoId: proyecto.id }} clienteId={proyecto.cliente_id} etiquetaCaja="Registra avances, acuerdos, decisiones o problemas del proyecto…" />
        </Card>
      )}

      <ProyectoFormModal abierto={editando} onCerrar={() => setEditando(false)} proyecto={proyecto} />
      <Confirmar
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo="¿Eliminar este proyecto?"
        texto="Se borrarán sus tareas y cobros. El historial queda en la ficha del cliente. Esta acción no se puede deshacer."
        cargando={eliminar.isPending}
        onConfirmar={() =>
          eliminar.mutate(
            { id: proyecto.id },
            {
              onSuccess: () => {
                toast.ok('Proyecto eliminado')
                navegar('/proyectos', { replace: true })
              },
              onSettled: () => setConfirmando(false),
            },
          )
        }
      />
    </>
  )
}

function Fila({ titulo, valor }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-mute">{titulo}</dt>
      <dd className="mt-0.5">{valor}</dd>
    </div>
  )
}

/* ───────── Cobros ───────── */

function Cobros({ proyecto, cobros, sinProgramar, dinero }) {
  const { esAdmin } = useAuth()
  const marcar = useMarcarCobro()
  const eliminar = useEliminarCobro()
  const [editando, setEditando] = useState(null) // null = cerrado · {} = nuevo · cobro = editar

  return (
    <Card className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
        <div>
          <h2 className="text-base font-bold">Cobros del proyecto</h2>
          <p className="text-xs text-mute">
            Programado {clp(dinero.total)} de {clp(proyecto.monto)}
            {sinProgramar > 0 && <> · falta programar <b className="text-ink-2">{clp(sinProgramar)}</b></>}
          </p>
        </div>
        <Button tamano="sm" icono={Plus} onClick={() => setEditando({})}>
          Agregar cobro
        </Button>
      </div>

      {cobros.length === 0 ? (
        <Vacio icono={Banknote} titulo="Sin cobros programados" texto="Registra los hitos de pago (anticipo, avance, entrega) para saber cuánto falta por cobrar." />
      ) : (
        <ul className="divide-y divide-line">
          {cobros.map((c) => {
            const vencido = c.estado === 'pendiente' && c.fecha_vencimiento && diasHasta(c.fecha_vencimiento) < 0
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate font-semibold">{c.concepto}</p>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-mute">
                    <CalendarClock className="size-3.5" aria-hidden />
                    {c.estado === 'pagado' ? `Pagado el ${fecha(c.pagado_at)}` : c.fecha_vencimiento ? `Vence ${fecha(c.fecha_vencimiento)}` : 'Sin fecha'}
                    {c.documento && <> · Doc. {c.documento}</>}
                  </p>
                </div>
                <span className="font-semibold">{clp(c.monto)}</span>
                {c.estado === 'pagado' ? <Badge tono="green">Pagado</Badge> : vencido ? <Badge tono="red">Vencido</Badge> : <Badge tono="amber">Pendiente</Badge>}
                <Button
                  tamano="sm"
                  variante={c.estado === 'pagado' ? 'fantasma' : 'secundario'}
                  onClick={() => marcar.mutate({ id: c.id, pagado: c.estado !== 'pagado' })}
                >
                  {c.estado === 'pagado' ? 'Deshacer' : 'Marcar pagado'}
                </Button>
                <BotonIcono icono={Pencil} etiqueta="Editar cobro" onClick={() => setEditando(c)} />
                {esAdmin && <BotonIcono icono={Trash2} etiqueta="Eliminar cobro" variante="peligro" onClick={() => eliminar.mutate({ id: c.id })} />}
              </li>
            )
          })}
        </ul>
      )}
      {editando && <FormularioCobro cobro={editando} proyecto={proyecto} sugerido={sinProgramar} onCerrar={() => setEditando(null)} />}
    </Card>
  )
}

function FormularioCobro({ cobro, proyecto, sugerido, onCerrar }) {
  const guardar = useGuardarCobro()
  const [v, campo] = useFormulario({
    concepto: cobro.concepto ?? '',
    monto: cobro.monto ?? (sugerido > 0 ? sugerido : ''),
    fecha_vencimiento: cobro.fecha_vencimiento ?? '',
    documento: cobro.documento ?? '',
  })
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={cobro.id ? 'Editar cobro' : 'Nuevo cobro'}
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cobro" cargando={guardar.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="form-cobro"
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          guardar.mutate({ id: cobro.id, proyectoId: proyecto.id, ...v }, { onSuccess: () => { toast.ok('Cobro guardado'); onCerrar() } })
        }}
      >
        <Campo label="Concepto" requerido>
          <Input {...campo('concepto')} required autoFocus maxLength={200} placeholder="Anticipo 50%, entrega final…" />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Monto (CLP)" requerido>
            <Input type="number" min="1" step="1" inputMode="numeric" required {...campo('monto')} />
          </Campo>
          <Campo label="Fecha de vencimiento">
            <Input type="date" {...campo('fecha_vencimiento')} />
          </Campo>
        </div>
        <Campo label="N.º de factura o boleta" ayuda="Opcional. Sirve para cuadrar con tu contabilidad.">
          <Input {...campo('documento')} />
        </Campo>
      </form>
    </Modal>
  )
}
