import { useState } from 'react'
import { useClientes } from '../api/clientes.js'
import { useActualizarOportunidad, useCrearOportunidad } from '../api/oportunidades.js'
import { Button, Campo, Input, Modal, Select, Textarea } from './ui.jsx'
import { SERVICIOS } from '../lib/dominio.js'
import { useFormulario } from '../lib/useFormulario.js'
import { toast } from '../lib/toast.js'

/**
 * Crear o editar una oportunidad.
 * - `clienteFijo` ({id, nombre}): se crea para ese cliente, sin selector.
 * - `oportunidad`: modo edición.
 */
export default function OportunidadFormModal({ abierto, ...props }) {
  return abierto ? <Formulario {...props} /> : null
}

function Formulario({ onCerrar, clienteFijo, oportunidad, onGuardado }) {
  const editar = Boolean(oportunidad)
  const { data: clientes = [] } = useClientes()
  const crear = useCrearOportunidad()
  const actualizar = useActualizarOportunidad()
  const [modo, setModo] = useState(null) // null = decidir según haya clientes o no
  const [v, campo] = useFormulario({
    titulo: oportunidad?.titulo ?? '',
    servicio: oportunidad?.servicio ?? 'sistemas',
    valor: oportunidad?.valor ?? '',
    fecha_cierre_estimada: oportunidad?.fecha_cierre_estimada ?? '',
    notas: oportunidad?.notas ?? '',
    nota: '',
    clienteId: '',
    cNombre: '',
    cEmail: '',
    cTelefono: '',
  })
  const modoCliente = modo ?? (clientes.length ? 'existente' : 'nuevo')
  const pendiente = crear.isPending || actualizar.isPending

  function enviar(e) {
    e.preventDefault()
    const datos = { titulo: v.titulo, servicio: v.servicio, valor: v.valor, fecha_cierre_estimada: v.fecha_cierre_estimada, notas: v.notas }
    const alTerminar = {
      onSuccess: (resultado) => {
        toast.ok(editar ? 'Oportunidad actualizada' : 'Oportunidad creada')
        onGuardado?.(resultado)
        onCerrar()
      },
    }
    if (editar) {
      actualizar.mutate({ id: oportunidad.id, ...datos }, alTerminar)
      return
    }
    const base = { ...datos, nota: v.nota }
    crear.mutate(
      clienteFijo
        ? { clienteId: clienteFijo.id, ...base }
        : modoCliente === 'existente'
          ? { clienteId: v.clienteId, ...base }
          : { cliente: { nombre: v.cNombre, email: v.cEmail, telefono: v.cTelefono }, ...base },
      alTerminar,
    )
  }

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={editar ? 'Editar oportunidad' : 'Nueva oportunidad'}
      descripcion={editar ? undefined : 'Una posible venta. Se mueve por el embudo hasta ganarse o perderse.'}
      ancho="max-w-xl"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-oportunidad" cargando={pendiente}>
            {editar ? 'Guardar cambios' : 'Crear oportunidad'}
          </Button>
        </>
      }
    >
      <form id="form-oportunidad" onSubmit={enviar} className="space-y-3">
        {!editar &&
          (clienteFijo ? (
            <Campo label="Cliente">
              <Input value={clienteFijo.nombre} disabled readOnly />
            </Campo>
          ) : (
            <fieldset className="space-y-3 rounded-2xl bg-paper p-3">
              <legend className="sr-only">Cliente</legend>
              {clientes.length > 0 && (
                <div className="flex gap-1 rounded-full bg-white p-1 text-sm font-semibold" role="radiogroup" aria-label="Tipo de cliente">
                  {[
                    ['existente', 'Cliente existente'],
                    ['nuevo', 'Cliente nuevo'],
                  ].map(([id, etiqueta]) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={modoCliente === id}
                      onClick={() => setModo(id)}
                      className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${modoCliente === id ? 'bg-acc text-white' : 'text-mute hover:text-ink'}`}
                    >
                      {etiqueta}
                    </button>
                  ))}
                </div>
              )}
              {modoCliente === 'existente' ? (
                <Campo label="Cliente" requerido>
                  <Select {...campo('clienteId')} required>
                    <option value="">Elige un cliente…</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </Select>
                </Campo>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Campo label="Nombre del cliente o empresa" requerido className="sm:col-span-2">
                    <Input {...campo('cNombre')} required maxLength={160} />
                  </Campo>
                  <Campo label="Correo">
                    <Input type="email" {...campo('cEmail')} />
                  </Campo>
                  <Campo label="Teléfono / WhatsApp">
                    <Input type="tel" {...campo('cTelefono')} />
                  </Campo>
                </div>
              )}
            </fieldset>
          ))}

        <Campo label="Título" requerido>
          <Input {...campo('titulo')} required maxLength={200} placeholder="Ej: ERP para constructora" autoFocus={editar || Boolean(clienteFijo)} />
        </Campo>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Servicio">
            <Select {...campo('servicio')}>
              {SERVICIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Campo>
          <Campo label="Valor estimado (CLP)">
            <Input type="number" min="0" step="1" inputMode="numeric" {...campo('valor')} placeholder="0" />
          </Campo>
          <Campo label="Cierre estimado" className="sm:col-span-2">
            <Input type="date" {...campo('fecha_cierre_estimada')} />
          </Campo>
        </div>
        {editar ? (
          <Campo label="Notas">
            <Textarea {...campo('notas')} />
          </Campo>
        ) : (
          <Campo label="Primera nota (opcional)">
            <Textarea {...campo('nota')} placeholder="Contexto de la conversación, qué necesita…" />
          </Campo>
        )}
      </form>
    </Modal>
  )
}
