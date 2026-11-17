import { Link } from 'react-router-dom'
import { Banknote, FolderKanban, Inbox, ListChecks, Rocket, Target, UserPlus } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useClientes } from '../../api/clientes.js'
import { useSolicitudes } from '../../api/leads.js'
import { useOportunidades } from '../../api/oportunidades.js'
import { avanceProyecto, resumenCobros, useCobrosPendientes, useProyectos } from '../../api/proyectos.js'
import { useCambiarTarea, useTareasPendientes } from '../../api/tareas.js'
import { Badge, Barra, Button, Card, Cargando, Kpi, Vacio } from '../../components/ui.jsx'
import { ETAPAS_ABIERTAS, ETAPA } from '../../lib/dominio.js'
import { clp, clpCorto, diasHasta, fechaCorta, haceCuanto } from '../../lib/format.js'
import { useTitulo } from '../../lib/useTitulo.js'
import { FilaTarea } from '../crm/Seguimientos.jsx'

export default function InicioPage() {
  useTitulo('Inicio')
  const { perfil, org, user } = useAuth()
  const consultas = {
    ops: useOportunidades(),
    proyectos: useProyectos(),
    tareas: useTareasPendientes(),
    cobros: useCobrosPendientes(),
    clientes: useClientes(),
    solicitudes: useSolicitudes(org.recibe_leads_web),
  }
  const cargando = Object.values(consultas).some((c) => c.isLoading)
  const cambiarTarea = useCambiarTarea()

  const { ops = [], proyectos = [], tareas = [], cobros = [], clientes = [], solicitudes = [] } = Object.fromEntries(Object.entries(consultas).map(([k, c]) => [k, c.data]))

  const usa = (id) => org.modulos?.includes(id)
  const primerNombre = (perfil?.nombre || user?.email || '').split(/[\s@]/)[0]
  const hoyLargo = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })

  const abiertas = ops.filter((o) => ETAPAS_ABIERTAS.includes(o.etapa))
  const valorAbierto = abiertas.reduce((s, o) => s + (Number(o.valor) || 0), 0)
  const dias = (t) => (t.fecha_limite ? diasHasta(t.fecha_limite) : null)
  const atrasadas = tareas.filter((t) => dias(t) !== null && dias(t) < 0)
  const deHoy = tareas.filter((t) => dias(t) === 0)
  const urgentes = [...atrasadas, ...deHoy]
  const nuevas = solicitudes.filter((l) => !l.convertida && l.estado === 'nuevo')
  const enCurso = proyectos.filter((p) => p.estado === 'en_curso')
  const porCobrar = resumenCobros(cobros)
  const porCerrar = abiertas.filter((o) => o.fecha_cierre_estimada).sort((a, b) => a.fecha_cierre_estimada.localeCompare(b.fecha_cierre_estimada)).slice(0, 5)
  const vacio = !cargando && clientes.length === 0 && ops.length === 0 && proyectos.length === 0

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-mute first-letter:uppercase">{hoyLargo}</p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Hola, {primerNombre} 👋</h1>
      </div>

      {cargando ? (
        <Cargando />
      ) : vacio ? (
        <Card className="p-8">
          <Vacio icono={Rocket} titulo={`Bienvenido al portal de ${org.nombre}`} texto="Empieza registrando tu primer cliente o una oportunidad de venta. Todo lo que hagas quedará con su historial.">
            <div className="flex flex-wrap justify-center gap-2">
              {usa('clientes') && (
                <Link to="/clientes">
                  <Button icono={UserPlus}>Crear un cliente</Button>
                </Link>
              )}
              {usa('crm') && (
                <Link to="/crm">
                  <Button variante="secundario" icono={Target}>
                    Ir al CRM
                  </Button>
                </Link>
              )}
            </div>
          </Vacio>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
            {usa('crm') && <Kpi etiqueta="Embudo abierto" valor={clpCorto(valorAbierto)} icono={Target} nota={`${abiertas.length} oportunidades`} to="/crm" />}
            {usa('crm') && org.recibe_leads_web && <Kpi etiqueta="Solicitudes nuevas" valor={nuevas.length} icono={Inbox} nota={nuevas.length ? 'esperan respuesta' : 'sin pendientes'} to="/crm?tab=solicitudes" />}
            {usa('crm') && <Kpi etiqueta="Tareas para hoy" valor={urgentes.length} icono={ListChecks} alerta={atrasadas.length > 0} nota={atrasadas.length ? `${atrasadas.length} atrasadas` : 'al día'} to="/crm?tab=seguimientos" />}
            {usa('proyectos') && <Kpi etiqueta="Proyectos en curso" valor={enCurso.length} icono={FolderKanban} nota={`${proyectos.filter((p) => p.estado === 'planificado').length} planificados`} to="/proyectos" />}
            {usa('proyectos') && <Kpi etiqueta="Por cobrar" valor={clpCorto(porCobrar.pendiente)} icono={Banknote} alerta={porCobrar.vencido > 0} nota={porCobrar.vencido > 0 ? `${clpCorto(porCobrar.vencido)} vencido` : 'sin vencidos'} to="/proyectos" />}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {usa('crm') && (
              <Panel titulo="Para hoy" enlace={{ to: '/crm?tab=seguimientos', texto: 'Ver todas' }}>
                {urgentes.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-mute">Nada urgente. {tareas.length > 0 ? `Tienes ${tareas.length} tareas más adelante.` : 'No hay tareas pendientes.'}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {urgentes.slice(0, 8).map((t) => (
                      <FilaTarea key={t.id} tarea={t} alCompletar={(x) => cambiarTarea.mutate({ id: x.id, estado: 'hecha' })} />
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {usa('crm') && org.recibe_leads_web && (
              <Panel titulo="Solicitudes del sitio" enlace={{ to: '/crm?tab=solicitudes', texto: 'Abrir bandeja' }}>
                {nuevas.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-mute">No hay solicitudes nuevas.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {nuevas.slice(0, 5).map((l) => (
                      <li key={l.id}>
                        <Link to="/crm?tab=solicitudes" className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-paper/60">
                          <span className="min-w-0 truncate text-sm font-semibold">{l.empresa || l.nombre}</span>
                          <span className="shrink-0 text-xs text-mute">{haceCuanto(l.created_at)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            )}

            {usa('proyectos') && (
              <Panel titulo="Proyectos en curso" enlace={{ to: '/proyectos', texto: 'Ver proyectos' }}>
                {enCurso.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-mute">No hay proyectos en curso.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {enCurso.slice(0, 5).map((p) => {
                      const avance = avanceProyecto(p)
                      return (
                        <li key={p.id}>
                          <Link to={`/proyectos/${p.id}`} className="block px-5 py-3 hover:bg-paper/60">
                            <div className="flex items-center justify-between gap-3">
                              <span className="min-w-0 truncate text-sm font-semibold">{p.nombre}</span>
                              <span className="shrink-0 text-xs font-semibold text-ink-2">{avance}%</span>
                            </div>
                            <p className="mb-1.5 truncate text-xs text-mute">{p.cliente?.nombre}</p>
                            <Barra valor={avance} />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Panel>
            )}

            {usa('proyectos') && (
              <Panel titulo="Próximos cobros">
                {cobros.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-mute">No hay cobros pendientes.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {cobros.slice(0, 5).map((c) => {
                      const vencido = c.fecha_vencimiento && diasHasta(c.fecha_vencimiento) < 0
                      return (
                        <li key={c.id}>
                          <Link to={`/proyectos/${c.proyecto.id}?tab=cobros`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-paper/60">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{c.concepto}</span>
                              <span className="block truncate text-xs text-mute">{c.proyecto.cliente?.nombre} · {c.proyecto.nombre}</span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-sm font-bold">{clp(c.monto)}</span>
                              {c.fecha_vencimiento && <Badge tono={vencido ? 'red' : 'slate'}>{vencido ? 'Vencido ' : ''}{fechaCorta(c.fecha_vencimiento)}</Badge>}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Panel>
            )}

            {usa('crm') && porCerrar.length > 0 && (
              <Panel titulo="Oportunidades por cerrar" enlace={{ to: '/crm', texto: 'Ver embudo' }}>
                <ul className="divide-y divide-line">
                  {porCerrar.map((o) => (
                    <li key={o.id}>
                      <Link to={`/crm/oportunidades/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-paper/60">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{o.titulo}</span>
                          <span className="block truncate text-xs text-mute">{o.cliente?.nombre}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <Badge tono={ETAPA[o.etapa].tono}>{ETAPA[o.etapa].label}</Badge>
                          <span className={`text-xs ${diasHasta(o.fecha_cierre_estimada) < 0 ? 'font-semibold text-red-600' : 'text-mute'}`}>{fechaCorta(o.fecha_cierre_estimada)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </>
      )}
    </>
  )
}

function Panel({ titulo, enlace, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-base font-bold">{titulo}</h2>
        {enlace && (
          <Link to={enlace.to} className="text-[13px] font-semibold text-acc hover:underline">
            {enlace.texto}
          </Link>
        )}
      </div>
      {children}
    </Card>
  )
}
