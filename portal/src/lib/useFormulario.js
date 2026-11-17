import { useState } from 'react'

/**
 * Estado de un formulario sin repetir código.
 *   const [valores, campo, setValores] = useFormulario({ nombre: '' })
 *   <Input {...campo('nombre')} />
 */
export function useFormulario(inicial) {
  const [valores, setValores] = useState(inicial)
  const campo = (nombre) => ({
    value: valores[nombre] ?? '',
    onChange: (e) => {
      const nuevo = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setValores((v) => ({ ...v, [nombre]: nuevo }))
    },
  })
  return [valores, campo, setValores]
}
