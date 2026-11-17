import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../auth/AuthContext.jsx'
import { GRUPOS, modulosVisibles } from '../modules/registry.js'
import { Avatar, cx } from '../components/ui.jsx'

function Marca({ className }) {
  return (
    <span className={cx('flex items-center gap-2.5', className)}>
      <img src={`${import.meta.env.BASE_URL}robot.svg`} alt="" className="h-9 w-auto" />
      <span className="leading-none">
        <b className="font-display text-xl font-extrabold tracking-tight">
          Integri<span className="text-[#9a90ff]">AI</span>
        </b>
        <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-on-night/70">Portal</span>
      </span>
    </span>
  )
}

export default function AppShell() {
  const { org, esAdmin, perfil, user, salir } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const ubicacion = useLocation()
  const modulos = modulosVisibles(org, esAdmin)
  const nombre = perfil?.nombre || user?.email?.split('@')[0] || 'Usuario'

  useEffect(() => setAbierto(false), [ubicacion.pathname])

  return (
    <div className="min-h-dvh lg:pl-64">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Saltar al contenido
      </a>

      {/* Barra superior en móvil */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-night px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-white lg:hidden">
        <Marca />
        <button type="button" onClick={() => setAbierto(true)} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label="Abrir menú">
          <Menu className="size-5" />
        </button>
      </header>

      {abierto && <div className="fixed inset-0 z-40 bg-night/60 lg:hidden" onClick={() => setAbierto(false)} aria-hidden />}

      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-night text-white transition-transform duration-200 lg:z-30 lg:w-64 lg:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Menú principal"
      >
        <div className="px-5 pb-4 pt-6">
          <Marca />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {GRUPOS.map((grupo) => {
            const items = modulos.filter((m) => m.grupo === grupo)
            if (!items.length) return null
            return (
              <div key={grupo} className="mt-4 first:mt-0">
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-on-night/60">{grupo}</p>
                <ul className="space-y-0.5">
                  {items.map((m) => (
                    <li key={m.id}>
                      <NavLink
                        to={m.ruta}
                        end={m.fin}
                        className={({ isActive }) =>
                          cx(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                            isActive ? 'bg-white/10 text-white' : 'text-on-night hover:bg-white/5 hover:text-white',
                          )
                        }
                      >
                        <m.icono className="size-[18px] shrink-0" aria-hidden />
                        {m.etiqueta}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </nav>

        <div className="border-t border-night-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar nombre={nombre} className="bg-night-2 text-on-night" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{nombre}</p>
              <p className="truncate text-xs text-on-night/70">{org?.nombre}</p>
            </div>
            <button
              type="button"
              onClick={salir}
              className="grid size-9 place-items-center rounded-full text-on-night hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <main id="contenido" className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
