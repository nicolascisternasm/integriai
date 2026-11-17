import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, ListChecks } from 'lucide-react'
import { useCambiarTarea, useTareasPendientes } from '../../api/tareas.js'
import { ChipPlazo } from '../../components/Paneles.jsx'
import { Card, Cargando, ErrorCarga, Vacio } from '../../components/ui.jsx'
import { diasHasta } from '../../lib/format.js'

/** Dónde enlazar según de qué cuelga la tarea. */
export function destinoTarea(t) {
  if (t.proyecto) return { to: `/proyectos/${t.proyecto.id}?tab=tareas`, texto: t.proyecto.nombre }
  if (t.oportunidad) return { to: `/crm/oportunidades/${t.oportunidad.id}`, texto: t.oportunidad.titulo }
  if (t.cliente) return { to: `/clientes/${t.cliente.id}`, texto: t.cliente.nombre }
  return null
}

export function FilaTarea({ tarea, alCompletar }) {
  const destino = destinoTarea(tarea)
  return (
    <li className="flex items-start gap-3 px-4 py-2.5">
      <button type="button" onClick={() => alCompletar(tarea)} className="mt-0.5 shrink-0 text-mute hover:text-emerald-600" aria-label={`Marcar como hecha: ${tarea.titulo}`}>
        <Circle className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium">{tarea.titulo}</p>
        {destino && (
          <Link to={destino.to} className="text-xs text-acc hover:underline">
            {destino.texto}
          </Link>
        )}
      </div>
      <ChipPlazo tarea={tarea} />
    </li>
  )
}

/** Todas las tareas abiertas, ordenadas por urgencia. */
export default function Seguimientos() {
  const { data: tareas = [], isLoading, error, refetch } = useTareasPendientes()
  const cambiar = useCambiarTarea()
  const completar = (t) => cambiar.mutate({ id: t.id, estado: 'hecha' })

  if (isLoading) return <Cargando />
  if (error) return <ErrorCarga error={error} onReintentar={refetch} />
  if (tareas.length === 0) {
    return (
      <Card>
        <Vacio icono={CheckCircle2} titulo="Todo al día" texto="No tienes tareas pendientes. Agrega seguimientos desde la ficha de un cliente, oportunidad o proyecto." />
      </Card>
    )
  }

  const dias = (t) => (t.fecha_limite ? diasHasta(t.fecha_limite) : null)
  const grupos = [
    { titulo: 'Atrasadas', tono: 'text-red-600', items: tareas.filter((t) => dias(t) !== null && dias(t) < 0) },
    { titulo: 'Hoy', tono: 'text-amber-700', items: tareas.filter((t) => dias(t) === 0) },
    { titulo: 'Próximas', tono: 'text-ink-2', items: tareas.filter((t) => dias(t) !== null && dias(t) > 0) },
    { titulo: 'Sin fecha', tono: 'text-mute', items: tareas.filter((t) => dias(t) === null) },
  ].filter((g) => g.items.length)

  return (
    <div className="space-y-5">
      {grupos.map((g) => (
        <section key={g.titulo}>
          <h3 className={`mb-1.5 flex items-center gap-2 px-1 font-sans text-sm font-bold tracking-normal ${g.tono}`}>
            <ListChecks className="size-4" aria-hidden /> {g.titulo} <span className="font-medium text-mute">{g.items.length}</span>
          </h3>
          <Card>
            <ul className="divide-y divide-line">
              {g.items.map((t) => (
                <FilaTarea key={t.id} tarea={t} alCompletar={completar} />
              ))}
            </ul>
          </Card>
        </section>
      ))}
    </div>
  )
}
