import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, Plus, Target } from 'lucide-react'
import { useMoverOportunidad, useOportunidades } from '../../api/oportunidades.js'
import OportunidadFormModal from '../../components/OportunidadFormModal.jsx'
import ProyectoFormModal from '../../components/ProyectoFormModal.jsx'
import { Badge, Button, Card, Cargando, ErrorCarga, Vacio, cx } from '../../components/ui.jsx'
import { ETAPAS, ETAPAS_ABIERTAS, servicioLabel } from '../../lib/dominio.js'
import { clp, clpCorto, diasHasta, fechaCorta } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'
import { ModalGanada, ModalPerdida } from './ModalesEmbudo.jsx'

const DIAS_CERRADAS = 60 // las ganadas/perdidas se muestran por este tiempo y luego salen del tablero

export default function Embudo() {
  const navegar = useNavigate()
  const { data: ops = [], isLoading, error, refetch } = useOportunidades()
  const mover = useMoverOportunidad()
  const [arrastrando, setArrastrando] = useState(null)
  const [sobre, setSobre] = useState(null)
  const [aPerder, setAPerder] = useState(null)
  const [ganada, setGanada] = useState(null)
  const [creandoProyecto, setCreandoProyecto] = useState(null)
  const [nueva, setNueva] = useState(false)

  const columnas = useMemo(() => {
    const limite = Date.now() - DIAS_CERRADAS * 86_400_000
    return ETAPAS.map((etapa) => ({
      ...etapa,
      items: ops.filter((o) => o.etapa === etapa.id && (ETAPAS_ABIERTAS.includes(etapa.id) || (o.cerrada_at && new Date(o.cerrada_at).getTime() >= limite))),
    }))
  }, [ops])

  const abiertas = ops.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa))
  const valorAbierto = abiertas.reduce((s, o) => s + (Number(o.valor) || 0), 0)

  function soltar(etapa) {
    const op = ops.find((o) => o.id === arrastrando)
    setArrastrando(null)
    setSobre(null)
    if (!op || op.etapa === etapa) return
    if (etapa === 'perdido') return setAPerder(op)
    mover.mutate({ oportunidad: op, etapa }, { onSuccess: () => etapa === 'ganado' && setGanada({ ...op, etapa }) })
  }

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-mute">
          <b className="text-ink">{abiertas.length}</b> {abiertas.length === 1 ? 'oportunidad abierta' : 'oportunidades abiertas'} por{' '}
          <b className="text-ink">{clp(valorAbierto)}</b>. Arrastra las tarjetas entre columnas, o ábrelas para cambiar la etapa.
        </p>
        <Button icono={Plus} onClick={() => setNueva(true)}>
          Nueva oportunidad
        </Button>
      </div>

      {ops.length === 0 ? (
        <Card>
          <Vacio icono={Target} titulo="Tu embudo está vacío" texto="Crea una oportunidad a mano, o convierte una solicitud que llegó por el sitio web.">
            <Button icono={Plus} onClick={() => setNueva(true)}>
              Nueva oportunidad
            </Button>
          </Vacio>
        </Card>
      ) : (
        <div className="scroll-fino -mx-4 flex items-start gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {columnas.map((col) => {
            const total = col.items.reduce((s, o) => s + (Number(o.valor) || 0), 0)
            const activa = sobre === col.id && arrastrando
            return (
              <section
                key={col.id}
                aria-label={`Etapa ${col.label}`}
                onDragOver={(e) => {
                  if (!arrastrando) return
                  e.preventDefault()
                  setSobre(col.id)
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setSobre(null)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  soltar(col.id)
                }}
                className={cx('w-[268px] shrink-0 rounded-2xl p-2 transition-colors', activa ? 'bg-acc-100' : 'bg-white/60')}
              >
                <header className="flex items-center justify-between px-2 pb-2 pt-1">
                  <h3 className="flex items-center gap-2 font-sans text-sm font-bold tracking-normal">
                    <span className={cx('size-2.5 rounded-full', col.punto)} aria-hidden />
                    {col.label}
                    <span className="rounded-full bg-paper px-1.5 py-0.5 text-[11px] font-semibold text-mute">{col.items.length}</span>
                  </h3>
                  {total > 0 && <span className="text-xs font-semibold text-mute">{clpCorto(total)}</span>}
                </header>
                <div className="space-y-2">
                  {col.items.map((op) => (
                    <Tarjeta key={op.id} op={op} arrastrada={arrastrando === op.id} onInicio={() => setArrastrando(op.id)} onFin={() => { setArrastrando(null); setSobre(null) }} />
                  ))}
                  {col.items.length === 0 && <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-xs text-mute">{ETAPAS_ABIERTAS.includes(col.id) ? 'Suelta una tarjeta aquí' : 'Sin cierres recientes'}</p>}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <OportunidadFormModal abierto={nueva} onCerrar={() => setNueva(false)} onGuardado={(o) => navegar(`/crm/oportunidades/${o.id}`)} />
      <ModalPerdida
        oportunidad={aPerder}
        onCerrar={() => setAPerder(null)}
        cargando={mover.isPending}
        onConfirmar={(motivo) => mover.mutate({ oportunidad: aPerder, etapa: 'perdido', motivo }, { onSuccess: () => { toast.ok('Marcada como perdida'); setAPerder(null) } })}
      />
      <ModalGanada oportunidad={ganada} onCerrar={() => setGanada(null)} onCrearProyecto={() => { setCreandoProyecto(ganada); setGanada(null) }} />
      <ProyectoFormModal abierto={Boolean(creandoProyecto)} onCerrar={() => setCreandoProyecto(null)} oportunidad={creandoProyecto} onGuardado={(p) => navegar(`/proyectos/${p.id}`)} />
    </>
  )
}

function Tarjeta({ op, arrastrada, onInicio, onFin }) {
  const abierta = ETAPAS_ABIERTAS.includes(op.etapa)
  const dias = diasHasta(op.fecha_cierre_estimada)
  const atrasada = abierta && dias !== null && dias < 0
  return (
    <Link
      to={`/crm/oportunidades/${op.id}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', op.id)
        e.dataTransfer.effectAllowed = 'move'
        onInicio()
      }}
      onDragEnd={onFin}
      className={cx(
        'block cursor-grab rounded-xl border border-line bg-white p-3 shadow-[0_1px_2px_rgba(31,28,29,.05)] transition-shadow hover:shadow-md active:cursor-grabbing',
        arrastrada && 'opacity-40',
      )}
    >
      <p className="line-clamp-2 text-sm font-semibold leading-snug">{op.titulo}</p>
      <p className="mt-0.5 truncate text-xs text-mute">{op.cliente?.nombre}</p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
        <span className="text-sm font-bold">{Number(op.valor) > 0 ? clpCorto(op.valor) : <span className="font-medium text-mute">Sin valor</span>}</span>
        {op.fecha_cierre_estimada && abierta && (
          <Badge tono={atrasada ? 'red' : 'slate'}>
            <CalendarClock className="size-3" aria-hidden />
            {fechaCorta(op.fecha_cierre_estimada)}
          </Badge>
        )}
      </div>
      {op.servicio && <p className="mt-1.5 truncate text-[11px] text-mute">{servicioLabel(op.servicio)}</p>}
    </Link>
  )
}
