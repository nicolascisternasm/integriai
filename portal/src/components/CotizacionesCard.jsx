import { useState } from 'react'
import { CalendarClock, ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { conIva, estadoEfectivo, useCambiarEstadoCotizacion, useCotizaciones, useEliminarCotizacion, useGuardarCotizacion } from '../api/cotizaciones.js'
import { Badge, BotonIcono, Button, Campo, Card, Cargando, Input, Modal, Select, Textarea, Vacio } from './ui.jsx'
import { ESTADOS_COTIZACION, ESTADO_COTIZACION, SEMAFOROS } from '../lib/dominio.js'
import { clp, diasHasta, fecha } from '../lib/format.js'
import { toast } from '../lib/toast.js'
import { useFormulario } from '../lib/useFormulario.js'

/** Vigencia de una cotización enviada: cuántos días le quedan o cuántos lleva vencida. */
export function ChipVigencia({ cotizacion }) {
  if (cotizacion.estado !== 'enviada' || !cotizacion.vigencia_hasta) return null
  const dias = diasHasta(cotizacion.vigencia_hasta)
  if (dias < 0) return <Badge tono="red">Vencida hace {Math.abs(dias)} {Math.abs(dias) === 1 ? 'día' : 'días'}</Badge>
  if (dias === 0) return <Badge tono="amber">Vence hoy</Badge>
  return <Badge tono={dias <= 3 ? 'amber' : 'slate'}>Vence en {dias} {dias === 1 ? 'día' : 'días'}</Badge>
}

export default function CotizacionesCard({ oportunidad }) {
  const { esAdmin } = useAuth()
  const { data: cotizaciones = [], isLoading } = useCotizaciones(oportunidad.id)
  const cambiar = useCambiarEstadoCotizacion()
  const eliminar = useEliminarCotizacion()
  const [editando, setEditando] = useState(null) // null = cerrado · {} = nueva · cotización = editar

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold">Cotizaciones</h2>
        <Button tamano="sm" variante="secundario" icono={Plus} onClick={() => setEditando({})}>
          Registrar
        </Button>
      </div>

      {isLoading ? (
        <Cargando />
      ) : cotizaciones.length === 0 ? (
        <Vacio icono={FileText} titulo="Aún no hay cotizaciones" texto="Las que prepare el agente cotizador aparecen aquí solas. También puedes registrarlas a mano." />
      ) : (
        <ul className="space-y-3">
          {cotizaciones.map((c) => {
            const estado = ESTADO_COTIZACION[estadoEfectivo(c)]
            const semaforo = c.semaforo && SEMAFOROS[c.semaforo]
            return (
              <li key={c.id} className="rounded-xl border border-line p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <b className="text-sm">{c.numero}</b>
                  <Badge tono={estado.tono}>{estado.label}</Badge>
                  <ChipVigencia cotizacion={c} />
                  {semaforo && <span className={`size-2.5 rounded-full ${semaforo.punto}`} title={semaforo.label} aria-label={semaforo.label} />}
                  <span className="ml-auto text-xs text-mute">{fecha(c.fecha)}</span>
                </div>
                <p className="mt-1.5 text-sm">{c.plan || 'Sin plan indicado'}</p>
                <p className="mt-0.5 text-sm">
                  <b>{clp(c.neto)}</b> + IVA <span className="text-mute">· total {clp(conIva(c.neto))}</span>
                </p>
                {Number(c.mensual) > 0 && <p className="text-xs text-mute">Plan mensual {clp(c.mensual)} + IVA</p>}
                {c.resumen && <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap break-words text-xs text-ink-2">{c.resumen}</p>}
                {c.documento_url && (
                  <a href={c.documento_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-acc hover:underline">
                    Ver documento <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Select
                    value={c.estado}
                    onChange={(e) => cambiar.mutate({ id: c.id, estado: e.target.value })}
                    className="h-8 w-auto py-0 text-[13px] font-semibold"
                    aria-label={`Estado de ${c.numero}`}
                  >
                    {ESTADOS_COTIZACION.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.label}
                      </option>
                    ))}
                  </Select>
                  <BotonIcono icono={Pencil} etiqueta={`Editar ${c.numero}`} onClick={() => setEditando(c)} />
                  {esAdmin && <BotonIcono icono={Trash2} etiqueta={`Eliminar ${c.numero}`} variante="peligro" onClick={() => eliminar.mutate({ id: c.id })} />}
                  {c.estado === 'enviada' && c.vigencia_hasta && (
                    <span className="ml-auto flex items-center gap-1 text-xs text-mute">
                      <CalendarClock className="size-3.5" aria-hidden /> hasta {fecha(c.vigencia_hasta)}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editando && <FormularioCotizacion cotizacion={editando} oportunidad={oportunidad} onCerrar={() => setEditando(null)} />}
    </Card>
  )
}

function FormularioCotizacion({ cotizacion, oportunidad, onCerrar }) {
  const guardar = useGuardarCotizacion()
  const editar = Boolean(cotizacion.id)
  const [v, campo] = useFormulario({
    plan: cotizacion.plan ?? '',
    neto: cotizacion.neto ?? oportunidad.valor ?? '',
    mensual: cotizacion.mensual ?? '',
    semaforo: cotizacion.semaforo ?? '',
    estado: cotizacion.estado ?? 'borrador',
    vigencia_hasta: cotizacion.vigencia_hasta ?? '',
    resumen: cotizacion.resumen ?? '',
    documento_url: cotizacion.documento_url ?? '',
  })

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={editar ? `Editar ${cotizacion.numero}` : 'Registrar cotización'}
      descripcion={editar ? undefined : 'El número (COT-AAAA-NNN) se asigna solo. La vigencia es de 15 días si no indicas otra fecha.'}
      ancho="max-w-xl"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cotizacion" cargando={guardar.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form
        id="form-cotizacion"
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          guardar.mutate(
            { id: cotizacion.id, clienteId: oportunidad.cliente_id, oportunidadId: oportunidad.id, ...v },
            { onSuccess: () => { toast.ok('Cotización guardada'); onCerrar() } },
          )
        }}
      >
        <Campo label="Plan o servicio" className="sm:col-span-2">
          <Input {...campo('plan')} placeholder="Plan Medio · Web corporativa" autoFocus />
        </Campo>
        <Campo label="Monto neto (CLP)" requerido ayuda={Number(v.neto) > 0 ? `Con IVA: ${clp(conIva(v.neto))}` : 'Sin IVA'}>
          <Input type="number" min="0" step="1" inputMode="numeric" required {...campo('neto')} />
        </Campo>
        <Campo label="Plan mensual neto (CLP)">
          <Input type="number" min="0" step="1" inputMode="numeric" {...campo('mensual')} placeholder="0" />
        </Campo>
        <Campo label="Estado">
          <Select {...campo('estado')}>
            {ESTADOS_COTIZACION.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Semáforo">
          <Select {...campo('semaforo')}>
            <option value="">Sin definir</option>
            {Object.entries(SEMAFOROS).map(([id, s]) => (
              <option key={id} value={id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Vigente hasta" className="sm:col-span-2">
          <Input type="date" {...campo('vigencia_hasta')} />
        </Campo>
        <Campo label="Resumen del alcance" className="sm:col-span-2">
          <Textarea rows={4} {...campo('resumen')} placeholder="Qué incluye, qué no, forma de pago…" />
        </Campo>
        <Campo label="Enlace al documento (PDF en Drive, etc.)" className="sm:col-span-2">
          <Input {...campo('documento_url')} placeholder="https://" />
        </Campo>
      </form>
    </Modal>
  )
}
