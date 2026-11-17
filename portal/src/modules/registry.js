import { lazy } from 'react'
import { LayoutDashboard, Target, Users, FolderKanban, Settings } from 'lucide-react'

/**
 * Registro de módulos del portal. Es el único lugar donde se declara un módulo:
 * el menú lateral y las rutas se generan desde aquí.
 *
 * Para agregar un módulo (p. ej. "cotizaciones"):
 *   1. Crear src/modules/cotizaciones/ con sus páginas.
 *   2. Agregar una entrada aquí.
 *   3. Activarlo para una organización:  update organizaciones set modulos = modulos || '{cotizaciones}' where ...
 *
 * - nucleo: siempre disponible, no depende de `organizaciones.modulos`.
 * - soloAdmin: solo propietario/administrador.
 * - rutas: path relativo a la raíz del portal; `index: true` para la portada.
 */
export const MODULES = [
  {
    id: 'inicio',
    etiqueta: 'Inicio',
    icono: LayoutDashboard,
    ruta: '/',
    fin: true,
    grupo: 'Principal',
    nucleo: true,
    rutas: [{ index: true, Pagina: lazy(() => import('./inicio/InicioPage.jsx')) }],
  },
  {
    id: 'crm',
    etiqueta: 'CRM',
    icono: Target,
    ruta: '/crm',
    grupo: 'Gestión',
    rutas: [
      { path: 'crm', Pagina: lazy(() => import('./crm/CRMPage.jsx')) },
      { path: 'crm/oportunidades/:id', Pagina: lazy(() => import('./crm/OportunidadPage.jsx')) },
    ],
  },
  {
    id: 'clientes',
    etiqueta: 'Clientes',
    icono: Users,
    ruta: '/clientes',
    grupo: 'Gestión',
    rutas: [
      { path: 'clientes', Pagina: lazy(() => import('./clientes/ClientesPage.jsx')) },
      { path: 'clientes/:id', Pagina: lazy(() => import('./clientes/ClienteDetallePage.jsx')) },
    ],
  },
  {
    id: 'proyectos',
    etiqueta: 'Proyectos',
    icono: FolderKanban,
    ruta: '/proyectos',
    grupo: 'Gestión',
    rutas: [
      { path: 'proyectos', Pagina: lazy(() => import('./proyectos/ProyectosPage.jsx')) },
      { path: 'proyectos/:id', Pagina: lazy(() => import('./proyectos/ProyectoDetallePage.jsx')) },
    ],
  },
  {
    id: 'configuracion',
    etiqueta: 'Configuración',
    icono: Settings,
    ruta: '/configuracion',
    grupo: 'Sistema',
    nucleo: true,
    rutas: [{ path: 'configuracion', Pagina: lazy(() => import('./configuracion/ConfiguracionPage.jsx')) }],
  },
]

export const GRUPOS = ['Principal', 'Gestión', 'Sistema']

export function moduloDisponible(modulo, org, esAdmin) {
  if (!org) return false
  if (modulo.soloAdmin && !esAdmin) return false
  return Boolean(modulo.nucleo) || org.modulos?.includes(modulo.id)
}

export const modulosVisibles = (org, esAdmin) => MODULES.filter((m) => moduloDisponible(m, org, esAdmin))
