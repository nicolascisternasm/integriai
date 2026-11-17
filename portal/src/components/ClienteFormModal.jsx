import { useGuardarCliente } from '../api/clientes.js'
import { Button, Campo, Input, Modal, Select, Textarea } from './ui.jsx'
import { ESTADOS_CLIENTE } from '../lib/dominio.js'
import { useFormulario } from '../lib/useFormulario.js'
import { toast } from '../lib/toast.js'

/** Crear o editar un cliente. El formulario se monta al abrir, así siempre parte con los datos correctos. */
export default function ClienteFormModal({ abierto, ...props }) {
  return abierto ? <Formulario {...props} /> : null
}

function Formulario({ onCerrar, cliente, onGuardado }) {
  const guardar = useGuardarCliente()
  const editar = Boolean(cliente)
  const [v, campo] = useFormulario({
    nombre: cliente?.nombre ?? '',
    tipo: cliente?.tipo ?? 'empresa',
    estado: cliente?.estado ?? 'prospecto',
    rut: cliente?.rut ?? '',
    rubro: cliente?.rubro ?? '',
    email: cliente?.email ?? '',
    telefono: cliente?.telefono ?? '',
    sitio_web: cliente?.sitio_web ?? '',
    direccion: cliente?.direccion ?? '',
    comuna: cliente?.comuna ?? '',
    ciudad: cliente?.ciudad ?? '',
    notas: cliente?.notas ?? '',
  })

  function enviar(e) {
    e.preventDefault()
    guardar.mutate(
      { id: cliente?.id, ...v },
      {
        onSuccess: (resultado) => {
          toast.ok(editar ? 'Cliente actualizado' : 'Cliente creado')
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
      titulo={editar ? 'Editar cliente' : 'Nuevo cliente'}
      ancho="max-w-2xl"
      pie={
        <>
          <Button variante="secundario" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form="form-cliente" cargando={guardar.isPending}>
            {editar ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </>
      }
    >
      <form id="form-cliente" onSubmit={enviar} className="grid gap-3 sm:grid-cols-2">
        <Campo label="Nombre o razón social" requerido className="sm:col-span-2">
          <Input {...campo('nombre')} required autoFocus maxLength={160} />
        </Campo>
        <Campo label="Tipo">
          <Select {...campo('tipo')}>
            <option value="empresa">Empresa</option>
            <option value="persona">Persona</option>
          </Select>
        </Campo>
        <Campo label="Estado">
          <Select {...campo('estado')}>
            {ESTADOS_CLIENTE.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </Select>
        </Campo>
        <Campo label="RUT">
          <Input {...campo('rut')} placeholder="76.123.456-7" />
        </Campo>
        <Campo label="Rubro">
          <Input {...campo('rubro')} placeholder="Construcción, retail…" />
        </Campo>
        <Campo label="Correo">
          <Input type="email" {...campo('email')} />
        </Campo>
        <Campo label="Teléfono / WhatsApp">
          <Input type="tel" {...campo('telefono')} placeholder="+56 9 1234 5678" />
        </Campo>
        <Campo label="Sitio web" className="sm:col-span-2">
          <Input {...campo('sitio_web')} placeholder="https://" />
        </Campo>
        <Campo label="Dirección" className="sm:col-span-2">
          <Input {...campo('direccion')} />
        </Campo>
        <Campo label="Comuna">
          <Input {...campo('comuna')} />
        </Campo>
        <Campo label="Ciudad">
          <Input {...campo('ciudad')} />
        </Campo>
        <Campo label="Notas internas" className="sm:col-span-2">
          <Textarea {...campo('notas')} placeholder="Cómo llegó, qué le importa, particularidades…" />
        </Campo>
      </form>
    </Modal>
  )
}
