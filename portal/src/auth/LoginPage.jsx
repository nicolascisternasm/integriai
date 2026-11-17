import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import { Button, Campo, Input } from '../components/ui.jsx'
import { useTitulo } from '../lib/useTitulo.js'

export default function LoginPage() {
  useTitulo('Ingresar')
  const { estado, entrar, recuperando } = useAuth()
  const ubicacion = useLocation()
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (recuperando) return <Navigate to="/restablecer" replace />
  if (estado === 'ok' || estado === 'sin_acceso') return <Navigate to={ubicacion.state?.desde || '/'} replace />

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await entrar(email.trim(), clave)
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <AuthLayout
      titulo="Ingresar al portal"
      subtitulo="Usa el correo y la contraseña de tu cuenta."
      pie={
        <a href="/" className="font-semibold text-acc hover:underline">
          ← Volver al sitio
        </a>
      }
    >
      <form onSubmit={enviar} className="space-y-4" noValidate={false}>
        <Campo label="Correo" requerido>
          <Input type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.cl" />
        </Campo>
        <Campo label="Contraseña" requerido>
          <div className="relative">
            <Input
              type={ver ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setVer((v) => !v)}
              className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-mute hover:bg-black/5"
              aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Campo>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" tamano="lg" className="w-full" cargando={enviando}>
          Ingresar
        </Button>
        <p className="text-center text-sm">
          <Link to="/recuperar" className="font-semibold text-acc hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
