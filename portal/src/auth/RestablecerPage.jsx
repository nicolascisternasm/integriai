import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import { Button, Campo, Input, PantallaCarga } from '../components/ui.jsx'
import { toast } from '../lib/toast.js'
import { useTitulo } from '../lib/useTitulo.js'

export default function RestablecerPage() {
  useTitulo('Nueva contraseña')
  const { sesion, cambiarClave } = useAuth()
  const navegar = useNavigate()
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (sesion === undefined) return <PantallaCarga />

  if (!sesion) {
    return (
      <AuthLayout titulo="Enlace no válido" subtitulo="Este enlace expiró o ya fue usado." pie={null}>
        <Link to="/recuperar" className="font-semibold text-acc hover:underline">
          Pedir un enlace nuevo
        </Link>
      </AuthLayout>
    )
  }

  async function guardar(e) {
    e.preventDefault()
    setError('')
    if (clave.length < 8) return setError('Usa al menos 8 caracteres.')
    if (clave !== repetida) return setError('Las contraseñas no coinciden.')
    setEnviando(true)
    try {
      await cambiarClave(clave)
      toast.ok('Contraseña actualizada')
      navegar('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <AuthLayout titulo="Crea tu nueva contraseña" subtitulo="Mínimo 8 caracteres.">
      <form onSubmit={guardar} className="space-y-4">
        <Campo label="Nueva contraseña" requerido>
          <Input type="password" autoComplete="new-password" required autoFocus value={clave} onChange={(e) => setClave(e.target.value)} />
        </Campo>
        <Campo label="Repite la contraseña" requerido>
          <Input type="password" autoComplete="new-password" required value={repetida} onChange={(e) => setRepetida(e.target.value)} />
        </Campo>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" tamano="lg" className="w-full" cargando={enviando}>
          Guardar contraseña
        </Button>
      </form>
    </AuthLayout>
  )
}
