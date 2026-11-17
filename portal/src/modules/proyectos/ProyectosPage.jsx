import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Banknote, FolderKanban, FolderPlus, Hammer, Wallet } from 'lucide-react'
import { resumenCobros, useProyectos } from '../../api/proyectos.js'
import ProyectoFormModal from '../../components/ProyectoFormModal.jsx'
import TarjetaProyecto from '../../components/TarjetaProyecto.jsx'
import { Button, Card, Cargando, Encabezado, ErrorCarga, Kpi, Vacio, cx } from '../../components/ui.jsx'
import { ESTADOS_PROYECTO, PROYECTO_ACTIVO } from '../../lib/dominio.js'
import { clpCorto } from '../../lib/format.js'
import { useTitulo } from '../../lib/useTitulo.js'

const FILTROS = [
  { id: 'activos', label: 'Activos' },
  ...ESTADOS_PROYECTO.map((e) => ({ id: e.id, label: e.label })),
  { id: 'todos', label: 'Todos' },
]

export default function ProyectosPage() {
  useTitulo('Proyectos')
  const navegar = useNavigate()
  const { data: proyectos = [], isLoading, error, refetch } = useProyectos()
  const [filtro, setFiltro] = useState('activos')
  const [nuevo, setNuevo] = useState(false)

  const kpi = useMemo(() => {
    const enCurso = proyectos.filter((p) => p.estado === 'en_curso')
    const activos = proyectos.filter((p) => PROYECTO_ACTIVO.includes(p.estado))
    const cobros = resumenCobros(proyectos.filter((p) => p.estado !== 'cancelado').flatMap((p) => p.cobros ?? []))
    return {
      enCurso: enCurso.length,
      valorActivos: activos.reduce((s, p) => s + Number(p.monto), 0),
      pendiente: cobros.pendiente,
      vencido: cobros.vencido,
    }
  }, [proyectos])

  const conteo = (id) => proyectos.filter((p) => (id === 'todos' ? true : id === 'activos' ? PROYECTO_ACTIVO.includes(p.estado) : p.estado === id)).length
  const visibles = proyectos.filter((p) => (filtro === 'todos' ? true : filtro === 'activos' ? PROYECTO_ACTIVO.includes(p.estado) : p.estado === filtro))

  return (
    <>
      <Encabezado titulo="Proyectos" subtitulo="Lo que estás construyendo para tus clientes: avance, entregas y cobros.">
        <Button icono={FolderPlus} onClick={() => setNuevo(true)}>
          Nuevo proyecto
        </Button>
      </Encabezado>

      {isLoading ? (
        <Cargando />
      ) : error ? (
        <ErrorCarga error={error} onReintentar={refetch} />
      ) : proyectos.length === 0 ? (
        <Card>
          <Vacio icono={FolderKanban} titulo="Aún no hay proyectos" texto="Crea uno desde aquí, desde la ficha de un cliente o al ganar una oportunidad en el CRM.">
            <Button icono={FolderPlus} onClick={() => setNuevo(true)}>
              Crear proyecto
            </Button>
          </Vacio>
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi etiqueta="En curso" valor={kpi.enCurso} icono={Hammer} nota="proyectos trabajándose hoy" />
            <Kpi etiqueta="Valor de proyectos activos" valor={clpCorto(kpi.valorActivos)} icono={Wallet} nota="planificados, en curso y pausados" />
            <Kpi etiqueta="Por cobrar" valor={clpCorto(kpi.pendiente)} icono={Banknote} nota="cobros pendientes" />
            <Kpi etiqueta="Cobros vencidos" valor={clpCorto(kpi.vencido)} icono={AlertTriangle} alerta={kpi.vencido > 0} nota={kpi.vencido > 0 ? 'requieren gestión' : 'todo al día'} />
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                  filtro === f.id ? 'border-acc bg-acc text-white' : 'border-line bg-white text-ink-2 hover:bg-paper',
                )}
              >
                {f.label} <span className={filtro === f.id ? 'text-white/80' : 'text-mute'}>{conteo(f.id)}</span>
              </button>
            ))}
          </div>

          {visibles.length === 0 ? (
            <Card>
              <Vacio icono={FolderKanban} titulo="Sin proyectos en este filtro" />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((p) => (
                <TarjetaProyecto key={p.id} proyecto={p} />
              ))}
            </div>
          )}
        </>
      )}

      <ProyectoFormModal abierto={nuevo} onCerrar={() => setNuevo(false)} onGuardado={(p) => navegar(`/proyectos/${p.id}`)} />
    </>
  )
}
