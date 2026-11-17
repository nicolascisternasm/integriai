import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Globe, Inbox, Mail, MessageCircle, UserCheck, X } from 'lucide-react'
import { comoLista, useConvertirSolicitud, useDescartarSolicitud, useSolicitudes } from '../../api/leads.js'
import { Badge, Button, Card, Cargando, Confirmar, ErrorCarga, Vacio } from '../../components/ui.jsx'
import { ETAPA, servicioLabel } from '../../lib/dominio.js'
import { enlaceWhatsApp, fechaHora, haceCuanto } from '../../lib/format.js'
import { toast } from '../../lib/toast.js'

/** Solicitudes del formulario de diagnóstico del sitio, listas para convertir en oportunidad. */
export default function Solicitudes() {
  const navegar = useNavigate()
  const { data: solicitudes = [], isLoading, error, refetch } = useSolicitudes(true)
  const convertir = useConvertirSolicitud()
  const descartar = useDescartarSolicitud()
  const [aDescartar, setADescartar] = useState(null)

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />

  const porGestionar = solicitudes.filter((l) => !l.convertida && l.estado === 'nuevo')
  const gestionadas = solicitudes.filter((l) => l.convertida || l.estado !== 'nuevo')

  return (
    <>
      {porGestionar.length === 0 ? (
        <Card>
          <Vacio icono={Inbox} titulo="No hay solicitudes nuevas" texto="Cada vez que alguien complete el formulario de diagnóstico en integriai.cl, aparecerá aquí." />
        </Card>
      ) : (
        <div className="space-y-3">
          {porGestionar.map((l) => (
            <Card key={l.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">
                    {l.empresa || l.nombre}
                    {l.empresa && <span className="font-medium text-mute"> · {l.nombre}</span>}
                  </p>
                  <p className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-acc hover:underline">
                        <Mail className="size-3.5" aria-hidden /> {l.email}
                      </a>
                    )}
                    {l.whatsapp && (
                      <a href={enlaceWhatsApp(l.whatsapp) ?? '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-acc hover:underline">
                        <MessageCircle className="size-3.5" aria-hidden /> {l.whatsapp}
                      </a>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {l.servicio && <Badge tono="violet">{servicioLabel(l.servicio)}</Badge>}
                  <span className="text-xs text-mute" title={fechaHora(l.created_at)}>
                    {haceCuanto(l.created_at)}
                  </span>
                </div>
              </div>

              {l.dificultades && <p className="mt-3 line-clamp-3 text-sm text-ink-2">{l.dificultades}</p>}

              <details className="mt-2 text-sm">
                <summary className="inline-block text-[13px] font-semibold text-acc">Ver todo lo que respondió</summary>
                <dl className="mt-2 grid gap-3 rounded-xl bg-paper p-3 sm:grid-cols-2">
                  <Dato t="Rubro" v={l.rubro} />
                  <Dato t="Sistemas que usa" v={l.sistemas} />
                  <Dato t="Dificultades" v={l.dificultades} ancho />
                  <Dato t="Tareas manuales" v={l.tareas_manuales} ancho />
                  <Dato t="Proceso a mejorar primero" v={l.procesos} ancho />
                  <Dato t="Llegó desde" v={l.pagina_origen} />
                  <Dato t="Campaña (UTM)" v={l.utm ? Object.entries(l.utm).map(([k, v]) => `${k}: ${v}`).join(' · ') : null} />
                </dl>
              </details>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  icono={UserCheck}
                  cargando={convertir.isPending && convertir.variables === l.id}
                  onClick={() => convertir.mutate(l.id, { onSuccess: (idOp) => { toast.ok('Oportunidad creada'); navegar(`/crm/oportunidades/${idOp}`) } })}
                >
                  Crear oportunidad
                </Button>
                <Button variante="peligro-suave" icono={X} onClick={() => setADescartar(l)}>
                  Descartar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {gestionadas.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm font-semibold text-mute">Ya gestionadas ({gestionadas.length})</summary>
          <Card className="mt-2 divide-y divide-line">
            {gestionadas.map((l) => {
              const idOp = comoLista(l.oportunidades)[0]?.id
              const fila = (
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate font-medium">{l.empresa || l.nombre}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-mute">{haceCuanto(l.created_at)}</span>
                    {l.estado === 'perdido' && !idOp ? <Badge tono="slate">Descartada</Badge> : <Badge tono={ETAPA[l.estado].tono}>{ETAPA[l.estado].label}</Badge>}
                  </span>
                </div>
              )
              return idOp ? (
                <Link key={l.id} to={`/crm/oportunidades/${idOp}`} className="block hover:bg-paper/60">
                  {fila}
                </Link>
              ) : (
                <div key={l.id}>{fila}</div>
              )
            })}
          </Card>
        </details>
      )}

      <Confirmar
        abierto={Boolean(aDescartar)}
        onCerrar={() => setADescartar(null)}
        titulo="¿Descartar esta solicitud?"
        texto={`Se marcará como descartada y saldrá de la bandeja. (${aDescartar?.empresa || aDescartar?.nombre || ''})`}
        textoBoton="Descartar"
        cargando={descartar.isPending}
        onConfirmar={() => descartar.mutate({ id: aDescartar.id }, { onSuccess: () => toast.ok('Solicitud descartada'), onSettled: () => setADescartar(null) })}
      />
    </>
  )
}

function Dato({ t, v, ancho }) {
  if (!v) return null
  return (
    <div className={ancho ? 'sm:col-span-2' : undefined}>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-mute">{t}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm">{v}</dd>
    </div>
  )
}
