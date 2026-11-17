import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { useEliminarOportunidad, useMoverOportunidad, useOportunidad } from '../../api/oportunidades.js'
import OportunidadFormModal from '../../components/OportunidadFormModal.jsx'
import ProyectoFormModal from '../../components/ProyectoFormModal.jsx'
import { ActividadPanel, TareasPanel } from '../../components/Paneles.jsx'
import { Badge, Button, Card, Cargando, Confirmar, Encabezado, ErrorCarga, Vacio, cx } from '../../components/ui.jsx'
import { ESTADO_PROYECTO, ETAPA, ETAPAS, ORIGENES, servicioLabel } from '../../lib/dominio.js'
import { clp, fecha, fechaHora } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'
import { useTitulo } from '../../lib/useTitulo.js'
import { ModalGanada, ModalPerdida } from './ModalesEmbudo.jsx'

export default function OportunidadPage() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { data: op, isLoading, error, refetch } = useOportunidad(id)
  const mover = useMoverOportunidad()
  const eliminar = useEliminarOportunidad()
  const [editando, setEditando] = useState(false)
  const [aPerder, setAPerder] = useState(false)
  const [ganada, setGanada] = useState(false)
  const [creandoProyecto, setCreandoProyecto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  useTitulo(op?.titulo ?? 'Oportunidad')

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />
  if (!op) {
    return (
      <Vacio titulo="Oportunidad no encontrada" texto="Puede que haya sido eliminada.">
        <Link to="/crm">
          <Button variante="secundario">Volver al CRM</Button>
        </Link>
      </Vacio>
    )
  }

  const etapa = ETAPA[op.etapa]
  const proyectos = op.proyectos ?? []

  function irAEtapa(destino) {
    if (destino === op.etapa) return
    if (destino === 'perdido') return setAPerder(true)
    mover.mutate({ oportunidad: op, etapa: destino }, { onSuccess: () => destino === 'ganado' && setGanada(true) })
  }

  return (
    <>
      <Encabezado
        atras={{ to: '/crm', label: 'CRM' }}
        titulo={op.titulo}
        subtitulo={
          <Link to={`/clientes/${op.cliente.id}`} className="font-semibold text-acc hover:underline">
            {op.cliente.nombre}
          </Link>
        }
      >
        <Button variante="secundario" icono={Pencil} onClick={() => setEditando(true)}>
          Editar
        </Button>
      </Encabezado>

      <Card className="mb-5 p-4">
        <p className="mb-2 text-[13px] font-semibold text-mute">Etapa</p>
        <div className="scroll-fino flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label="Cambiar de etapa">
          {ETAPAS.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={op.etapa === e.id}
              disabled={mover.isPending}
              onClick={() => irAEtapa(e.id)}
              className={cx(
                'flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-60',
                op.etapa === e.id ? 'border-transparent bg-acc text-white' : 'border-line bg-white text-ink-2 hover:bg-paper',
              )}
            >
              <span className={cx('size-2 rounded-full', op.etapa === e.id ? 'bg-white' : e.punto)} aria-hidden />
              {e.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-bold">Detalles</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Fila t="Estado" v={<Badge tono={etapa.tono}>{etapa.label}</Badge>} />
              <Fila t="Valor estimado" v={Number(op.valor) > 0 ? <b>{clp(op.valor)}</b> : '—'} />
              <Fila t="Servicio" v={servicioLabel(op.servicio)} />
              <Fila t="Cierre estimado" v={fecha(op.fecha_cierre_estimada)} />
              <Fila t="Origen" v={ORIGENES[op.origen] ?? op.origen} />
              <Fila t="Creada" v={fecha(op.created_at)} />
              {op.cerrada_at && <Fila t="Cerrada" v={fecha(op.cerrada_at)} />}
              {op.etapa === 'perdido' && op.motivo_perdida && <Fila t="Motivo de pérdida" v={op.motivo_perdida} ancho />}
              {op.lead && <Fila t="Solicitud web" v={`${fechaHora(op.lead.created_at)}${op.lead.pagina_origen ? ` · ${op.lead.pagina_origen}` : ''}`} ancho />}
            </dl>
            {op.notas && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-mute">Notas</p>
                <p className="whitespace-pre-wrap break-words text-sm text-ink-2">{op.notas}</p>
              </div>
            )}
          </Card>

          {(op.etapa === 'ganado' || proyectos.length > 0) && (
            <Card className="p-5">
              <h2 className="mb-3 text-base font-bold">Proyectos</h2>
              {proyectos.length === 0 ? (
                <p className="mb-3 text-sm text-mute">Esta venta aún no tiene proyecto.</p>
              ) : (
                <ul className="mb-3 divide-y divide-line">
                  {proyectos.map((p) => (
                    <li key={p.id}>
                      <Link to={`/proyectos/${p.id}`} className="flex items-center justify-between gap-2 py-2 text-sm font-semibold hover:text-acc">
                        <span className="truncate">{p.nombre}</span>
                        <Badge tono={ESTADO_PROYECTO[p.estado].tono}>{ESTADO_PROYECTO[p.estado].label}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Button variante="secundario" icono={FolderPlus} onClick={() => setCreandoProyecto(true)}>
                Crear proyecto
              </Button>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="mb-3 text-base font-bold">Seguimientos</h2>
            <TareasPanel ambito={{ oportunidadId: op.id, clienteId: op.cliente_id }} placeholder="Ej: Enviar propuesta el viernes" textoVacio="Sin seguimientos. Agrega el próximo paso." />
          </Card>

          <div>
            <Button variante="peligro-suave" icono={Trash2} onClick={() => setConfirmando(true)}>
              Eliminar oportunidad
            </Button>
          </div>
        </div>

        <Card className="h-fit p-5">
          <h2 className="mb-3 text-base font-bold">Historial</h2>
          <ActividadPanel ambito={{ oportunidadId: op.id }} clienteId={op.cliente_id} />
        </Card>
      </div>

      <OportunidadFormModal abierto={editando} onCerrar={() => setEditando(false)} oportunidad={op} />
      <ModalPerdida
        oportunidad={aPerder ? op : null}
        onCerrar={() => setAPerder(false)}
        cargando={mover.isPending}
        onConfirmar={(motivo) => mover.mutate({ oportunidad: op, etapa: 'perdido', motivo }, { onSuccess: () => { toast.ok('Marcada como perdida'); setAPerder(false) } })}
      />
      <ModalGanada oportunidad={ganada ? op : null} onCerrar={() => setGanada(false)} onCrearProyecto={() => { setGanada(false); setCreandoProyecto(true) }} />
      <ProyectoFormModal abierto={creandoProyecto} onCerrar={() => setCreandoProyecto(false)} oportunidad={op} onGuardado={(p) => navegar(`/proyectos/${p.id}`)} />
      <Confirmar
        abierto={confirmando}
        onCerrar={() => setConfirmando(false)}
        titulo="¿Eliminar esta oportunidad?"
        texto="Se borrarán sus seguimientos. Los proyectos creados desde ella se conservan. Esta acción no se puede deshacer."
        cargando={eliminar.isPending}
        onConfirmar={() =>
          eliminar.mutate(
            { id: op.id },
            {
              onSuccess: () => {
                toast.ok('Oportunidad eliminada')
                navegar('/crm', { replace: true })
              },
              onSettled: () => setConfirmando(false),
            },
          )
        }
      />
    </>
  )
}

function Fila({ t, v, ancho }) {
  return (
    <div className={ancho ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2' : undefined}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-mute">{t}</dt>
      <dd className="mt-0.5 break-words">{v || '—'}</dd>
    </div>
  )
}
