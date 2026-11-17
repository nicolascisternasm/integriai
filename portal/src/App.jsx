import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { MODULES } from './modules/registry.js'
import { NoEncontrada, RequireAuth, RequireModulo } from './router/guards.jsx'
import AppShell from './layout/AppShell.jsx'
import LoginPage from './auth/LoginPage.jsx'
import RecuperarPage from './auth/RecuperarPage.jsx'
import RestablecerPage from './auth/RestablecerPage.jsx'
import { Cargando, Toaster } from './components/ui.jsx'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar" element={<RecuperarPage />} />
        <Route path="/restablecer" element={<RestablecerPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            {/* Las rutas salen del registro de módulos: ver src/modules/registry.js */}
            {MODULES.flatMap((modulo) =>
              modulo.rutas.map(({ Pagina, ...ruta }) => (
                <Route
                  key={`${modulo.id}:${ruta.path ?? 'index'}`}
                  {...ruta}
                  element={
                    <RequireModulo modulo={modulo}>
                      <Suspense fallback={<Cargando />}>
                        <Pagina />
                      </Suspense>
                    </RequireModulo>
                  }
                />
              )),
            )}
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
