import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { avanceProyecto, resumenCobros } from '../api/proyectos.js'
import { Badge, Barra, Card } from './ui.jsx'
import { ESTADO_PROYECTO, servicioLabel } from '../lib/dominio.js'
import { clpCorto, diasHasta, fechaCorta } from '../lib/format.js'

/** Resumen de un proyecto: estado, avance por tareas, entrega y plata. Requiere `tareas` y `cobros` incrustados. */
export default function TarjetaProyecto({ proyecto, mostrarCliente = true }) {
  const avance = avanceProyecto(proyecto)
  const cobros = resumenCobros(proyecto.cobros)
  const estado = ESTADO_PROYECTO[proyecto.estado]
  const abierto = !['entregado', 'cancelado'].includes(proyecto.estado)
  const atrasado = abierto && proyecto.fecha_entrega && diasHasta(proyecto.fecha_entrega) < 0
  const tareas = proyecto.tareas ?? []

  return (
    <Link to={`/proyectos/${proyecto.id}`} className="block h-full rounded-2xl">
      <Card className="flex h-full flex-col p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-sans text-[15px] font-bold leading-snug tracking-normal">{proyecto.nombre}</h3>
          <Badge tono={estado.tono} className="shrink-0">
            {estado.label}
          </Badge>
        </div>
        {mostrarCliente && proyecto.cliente && <p className="mt-0.5 truncate text-sm text-mute">{proyecto.cliente.nombre}</p>}
        <p className="mt-0.5 text-xs text-mute">{servicioLabel(proyecto.servicio)}</p>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs">
            <span className="font-semibold text-ink-2">{avance}% completado</span>
            <span className="text-mute">
              {tareas.filter((t) => t.estado === 'hecha').length} de {tareas.length} tareas
            </span>
          </div>
          <Barra valor={avance} />
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 text-xs">
          {proyecto.fecha_entrega ? (
            <Badge tono={atrasado ? 'red' : 'slate'}>
              <CalendarClock className="size-3" aria-hidden />
              {atrasado ? 'Atrasado · ' : 'Entrega '}
              {fechaCorta(proyecto.fecha_entrega)}
            </Badge>
          ) : (
            <span className="text-mute">Sin fecha de entrega</span>
          )}
          <span className="text-right">
            <b className="text-ink">{clpCorto(proyecto.monto)}</b>
            {cobros.pendiente > 0 && <span className={cobros.vencido > 0 ? 'ml-1 font-semibold text-red-600' : 'ml-1 text-mute'}>· {clpCorto(cobros.pendiente)} por cobrar</span>}
          </span>
        </div>
      </Card>
    </Link>
  )
}
