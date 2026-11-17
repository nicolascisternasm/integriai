import { useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { Button, Campo, Modal, Textarea } from '../../components/ui.jsx'

/** Pide el motivo al marcar una oportunidad como perdida (opcional, pero sirve para aprender). */
export function ModalPerdida({ oportunidad, onCerrar, onConfirmar, cargando }) {
  return oportunidad ? <PerdidaInterno oportunidad={oportunidad} onCerrar={onCerrar} onConfirmar={onConfirmar} cargando={cargando} /> : null
}

function PerdidaInterno({ oportunidad, onCerrar, onConfirmar, cargando }) {
  const [motivo, setMotivo] = useState('')
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo="Marcar como perdida"
      descripcion={oportunidad.titulo}
      ancho="max-w-md"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="peligro" cargando={cargando} onClick={() => onConfirmar(motivo)}>
            Marcar como perdida
          </Button>
        </>
      }
    >
      <Campo label="¿Por qué se perdió?" ayuda="Precio, tiempo, eligió a otro, no respondió… Te servirá para mejorar la propuesta.">
        <Textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} autoFocus maxLength={500} />
      </Campo>
    </Modal>
  )
}

/** Al ganar una oportunidad, ofrece crear el proyecto de inmediato. */
export function ModalGanada({ oportunidad, onCerrar, onCrearProyecto }) {
  if (!oportunidad) return null
  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo="¡Oportunidad ganada!"
      ancho="max-w-md"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Más tarde
          </Button>
          <Button onClick={onCrearProyecto}>Crear proyecto</Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <PartyPopper className="size-5" aria-hidden />
        </span>
        <p className="text-sm text-ink-2">
          Cerraste <b className="text-ink">{oportunidad.titulo}</b>. El cliente pasó a <b>cliente activo</b>. ¿Quieres crear ahora el proyecto para seguir tareas, avance y cobros?
        </p>
      </div>
    </Modal>
  )
}
