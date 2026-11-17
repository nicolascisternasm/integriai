import { useClientes } from '../api/clientes.js'
import { useGuardarProyecto } from '../api/proyectos.js'
import { Button, Campo, Input, Modal, Select, Textarea } from './ui.jsx'
import { ESTADOS_PROYECTO, SERVICIOS } from '../lib/dominio.js'
import { useFormulario } from '../lib/useFormulario.js'
import { toast } from '../lib/toast.js'

/**
 * Crear o editar un proyecto.
 * - `clienteFijo` ({id, nombre}): el proyecto es de ese cliente.
 * - `oportunidad`: precarga nombre, servicio y monto desde una oportunidad ganada.
 * - `proyecto`: modo edición.
 */
export default function ProyectoFormModal({ abierto, ...props }) {
  return abierto ? <Formulario {...props} /> : null
}

function Formulario({ onCerrar, clienteFijo, oportunidad, proyecto, onGuardado }) {
  const editar = Boolean(proyecto)
  const { data: clientes = [] } = useClientes()
  const guardar = useGuardarProyecto()
  const [v, campo] = useFormulario({
    clienteId: clienteFijo?.id ?? oportunidad?.cliente_id ?? '',
    nombre: proyecto?.nombre ?? oportunidad?.titulo ?? '',
    servicio: proyecto?.servicio ?? oportunidad?.servicio ?? 'sistemas',
    estado: proyecto?.estado ?? 'planificado',
    descripcion: proyecto?.descripcion ?? '',
    fecha_inicio: proyecto?.fecha_inicio ?? '',
    fecha_entrega: proyecto?.fecha_entrega ?? '',
    monto: proyecto?.monto ?? oportunidad?.valor ?? '',
    url: proyecto?.url ?? '',
  })
  const clienteBloqueado = editar || Boolean(clienteFijo) || Boolean(oportunidad)
  const nombreCliente = clienteFijo?.nombre ?? proyecto?.cliente?.nombre ?? oportunidad?.cliente?.nombre ?? clientes.find((c) => c.id === v.clienteId)?.nombre ?? ''

  function enviar(e) {
    e.preventDefault()
    const { clienteId, ...resto } = v
    guardar.mutate(
      editar ? { id: proyecto.id, entregado_at: proyecto.entregado_at, ...resto } : { clienteId, oportunidadId: oportunidad?.id ?? null, ...resto },
      {
        onSuccess: (resultado) => {
          toast.ok(editar ? 'Proyecto actualizado' : 'Proyecto creado')
          onGuardado?.(resultado)
          onCerrar()
        },
      },
    )
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={editar ? 'Editar proyecto' : 'Nuevo proyecto'}
      ancho="max-w-2xl"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-proyecto" cargando={guardar.isPending}>
            {editar ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </>
      }
    >
      <form id="form-proyecto" onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
        <Campo label="Cliente" requerido className="sm:col-span-2">
          {clienteBloqueado ? (
            <Input value={nombreCliente} disabled readOnly />
          ) : (
            <Select {...campo('clienteId')} required autoFocus>
              <option value="">Elige un cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </Campo>
        <Campo label="Nombre del proyecto" requerido className="sm:col-span-2">
          <Input {...campo('nombre')} required maxLength={200} placeholder="Ej: ERP de gestión de obras" autoFocus={clienteBloqueado} />
        </Campo>
        <Campo label="Servicio">
          <Select {...campo('servicio')}>
            {SERVICIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Estado">
          <Select {...campo('estado')}>
            {ESTADOS_PROYECTO.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="Inicio">
          <Input type="date" {...campo('fecha_inicio')} />
        </Campo>
        <Campo label="Entrega estimada">
          <Input type="date" {...campo('fecha_entrega')} />
        </Campo>
        <Campo label="Monto del proyecto (CLP)">
          <Input type="number" min="0" step="1" inputMode="numeric" {...campo('monto')} placeholder="0" />
        </Campo>
        <Campo label="Enlace (sitio, repositorio, carpeta)">
          <Input {...campo('url')} placeholder="https://" />
        </Campo>
        <Campo label="Alcance y detalles" className="sm:col-span-2">
          <Textarea rows={4} {...campo('descripcion')} placeholder="Qué incluye, entregables, acuerdos importantes…" />
        </Campo>
      </form>
    </Modal>
  )
}
