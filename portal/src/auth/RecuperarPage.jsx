import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import { Button, Campo, Input } from '../components/ui.jsx'
import { useTitulo } from '../lib/useTitulo.js'

export default function RecuperarPage() {
  useTitulo('Recuperar contraseña')
  const { recuperar } = useAuth()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await recuperar(email.trim())
      setEnviado(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Recuperar contraseña"
      subtitulo="Te enviaremos un enlace para crear una nueva."
      pie={
        <Link to="/login" className="font-semibold text-acc hover:underline">
          ← Volver a ingresar
        </Link>
      }
    >
      {enviado ? (
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <MailCheck className="mx-auto mb-2 size-8 text-acc" aria-hidden />
          <p className="font-semibold">Revisa tu correo</p>
          <p className="mt-1 text-sm text-mute">Si la cuenta existe, te enviamos un enlace para restablecer la contraseña. Puede tardar un par de minutos.</p>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <Campo label="Correo de tu cuenta" requerido>
            <Input type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </Campo>
          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" tamano="lg" className="w-full" cargando={enviando}>
            Enviar enlace
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
