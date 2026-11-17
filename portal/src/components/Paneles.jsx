import { useState } from 'react'
import { CheckCircle2, Circle, CircleDot, ListChecks, MessageSquarePlus, Plus, Trash2 } from 'lucide-react'
import { useActividades, useCrearActividad } from '../api/actividades.js'
import { useCambiarTarea, useCrearTarea, useEliminarTarea, useTareas } from '../api/tareas.js'
import { Badge, BotonIcono, Button, Cargando, Input, Select, Textarea, Vacio, cx } from './ui.jsx'
import { TIPO_ACTIVIDAD, TIPOS_MANUALES } from '../lib/dominio.js'
import { diasHasta, fechaCorta, fechaHora, haceCuanto } from '../lib/format.js'

/** Etiqueta del plazo de una tarea: vencida (rojo), hoy (ámbar) o la fecha. */
export function ChipPlazo({ tarea }) {
  if (tarea.estado === 'hecha' || !tarea.fecha_limite) return null
  const dias = diasHasta(tarea.fecha_limite)
  if (dias < 0) return <Badge tono="red">Vencida · {fechaCorta(tarea.fecha_limite)}</Badge>
  if (dias === 0) return <Badge tono="amber">Hoy</Badge>
  if (dias === 1) return <Badge tono="blue">Mañana</Badge>
  return <Badge tono="slate">{fechaCorta(tarea.fecha_limite)}</Badge>
}

const ICONO_ESTADO = { pendiente: Circle, en_progreso: CircleDot, hecha: CheckCircle2 }
const ETIQUETA_ESTADO = { pendiente: 'Pendiente', en_progreso: 'En progreso', hecha: 'Hecha' }
// Seguimiento comercial: pendiente ⇄ hecha. Proyecto: pendiente → en progreso → hecha.
const SIGUIENTE_SIMPLE = { pendiente: 'hecha', en_progreso: 'hecha', hecha: 'pendiente' }
const SIGUIENTE_PROYECTO = { pendiente: 'en_progreso', en_progreso: 'hecha', hecha: 'pendiente' }

/**
 * Lista de tareas con alta rápida. `ambito` define de quién son: { clienteId, oportunidadId, proyectoId }.
 * `ciclo="proyecto"` agrega el estado intermedio "en progreso".
 */
export function TareasPanel({ ambito, ciclo = 'simple', placeholder = 'Nueva tarea…', textoVacio = 'Sin tareas todavía.' }) {
  const { data: tareas = [], isLoading } = useTareas(ambito)
  const crear = useCrearTarea()
  const cambiar = useCambiarTarea()
  const eliminar = useEliminarTarea()
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const siguiente = ciclo === 'proyecto' ? SIGUIENTE_PROYECTO : SIGUIENTE_SIMPLE

  const abiertas = tareas.filter((t) => t.estado !== 'hecha')
  const hechas = tareas.filter((t) => t.estado === 'hecha')

  function agregar(e) {
    e.preventDefault()
    if (!titulo.trim()) return
    crear.mutate(
      { titulo, fecha, ...ambito },
      {
        onSuccess: () => {
          setTitulo('')
          setFecha('')
        },
      },
    )
  }

  const fila = (t) => {
    const Icono = ICONO_ESTADO[t.estado]
    return (
      <li key={t.id} className="flex items-start gap-2 rounded-xl px-1 py-1.5 hover:bg-paper/70">
        <button
          type="button"
          onClick={() => cambiar.mutate({ id: t.id, estado: siguiente[t.estado] })}
          className={cx('mt-0.5 shrink-0 rounded-full', t.estado === 'hecha' ? 'text-emerald-600' : t.estado === 'en_progreso' ? 'text-acc' : 'text-mute hover:text-acc')}
          aria-label={`${ETIQUETA_ESTADO[t.estado]}. Cambiar estado de: ${t.titulo}`}
          title={ETIQUETA_ESTADO[t.estado]}
        >
          <Icono className="size-5" />
        </button>
        <span className={cx('min-w-0 flex-1 break-words text-sm', t.estado === 'hecha' && 'text-mute line-through')}>{t.titulo}</span>
        <ChipPlazo tarea={t} />
        <BotonIcono icono={Trash2} etiqueta="Eliminar tarea" variante="peligro" className="size-7" onClick={() => eliminar.mutate({ id: t.id })} />
      </li>
    )
  }

  return (
    <div>
      {isLoading ? (
        <Cargando />
      ) : tareas.length === 0 ? (
        <Vacio icono={ListChecks} titulo={textoVacio} />
      ) : (
        <>
          <ul className="space-y-0.5">{abiertas.map(fila)}</ul>
          {hechas.length > 0 && (
            <details className="mt-2">
              <summary className="px-1 text-xs font-semibold text-mute">Completadas ({hechas.length})</summary>
              <ul className="mt-1 space-y-0.5">{hechas.map(fila)}</ul>
            </details>
          )}
        </>
      )}

      <form onSubmit={agregar} className="mt-3 flex flex-wrap gap-2">
        <Input className="min-w-0 flex-1 basis-48" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={placeholder} maxLength={300} aria-label="Título de la tarea" />
        <Input type="date" className="w-auto" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label="Fecha límite" />
        <Button type="submit" variante="secundario" icono={Plus} cargando={crear.isPending} disabled={!titulo.trim()}>
          Agregar
        </Button>
      </form>
    </div>
  )
}

/**
 * Historial con caja para registrar notas, llamadas, reuniones…
 * `ambito` filtra qué se muestra; `clienteId` es obligatorio para registrar (todo cuelga de un cliente).
 */
export function ActividadPanel({ ambito, clienteId, etiquetaCaja = 'Escribe una nota, o lo que hablaste con el cliente…' }) {
  const { data: actividades = [], isLoading } = useActividades(ambito)
  const crear = useCrearActividad()
  const [tipo, setTipo] = useState('nota')
  const [detalle, setDetalle] = useState('')

  function registrar(e) {
    e.preventDefault()
    if (!detalle.trim()) return
    crear.mutate(
      { clienteId, oportunidadId: ambito.oportunidadId ?? null, proyectoId: ambito.proyectoId ?? null, tipo, detalle },
      { onSuccess: () => setDetalle('') },
    )
  }

  return (
    <div>
      <form onSubmit={registrar} className="space-y-2">
        <Textarea value={detalle} onChange={(e) => setDetalle(e.target.value)} placeholder={etiquetaCaja} maxLength={5000} aria-label="Detalle" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-auto" aria-label="Tipo de registro">
            {TIPOS_MANUALES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
          <Button type="submit" icono={MessageSquarePlus} cargando={crear.isPending} disabled={!detalle.trim()}>
            Registrar
          </Button>
        </div>
      </form>

      <div className="mt-5">
        {isLoading ? (
          <Cargando />
        ) : actividades.length === 0 ? (
          <Vacio icono={MessageSquarePlus} titulo="Aún no hay historial" texto="Lo que registres aparecerá aquí, con fecha y autor." />
        ) : (
          <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
            {actividades.map((a) => {
              const tipoInfo = TIPO_ACTIVIDAD[a.tipo] ?? TIPO_ACTIVIDAD.nota
              const Icono = tipoInfo.icono
              return (
                <li key={a.id} className="relative flex gap-3">
                  <span className={cx('z-10 grid size-8 shrink-0 place-items-center rounded-full border border-line bg-white', a.tipo === 'etapa' || a.tipo === 'sistema' ? 'text-mute' : 'text-acc')}>
                    <Icono className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs text-mute">
                      <b className="font-semibold text-ink-2">{tipoInfo.label}</b>
                      {a.usuario_nombre && <> · {a.usuario_nombre}</>} ·{' '}
                      <time dateTime={a.created_at} title={fechaHora(a.created_at)}>
                        {haceCuanto(a.created_at)}
                      </time>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">{a.detalle}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
