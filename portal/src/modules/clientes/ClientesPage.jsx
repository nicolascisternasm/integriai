import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { contactoPrincipal, useClientes } from '../../api/clientes.js'
import ClienteFormModal from '../../components/ClienteFormModal.jsx'
import { Avatar, Badge, Button, Card, Cargando, Encabezado, ErrorCarga, Input, Vacio, cx } from '../../components/ui.jsx'
import { ESTADOS_CLIENTE, ESTADO_CLIENTE } from '../../lib/dominio.js'
import { normalizar } from '../../lib/format.js'
import { useTitulo } from '../../lib/useTitulo.js'

export default function ClientesPage() {
  useTitulo('Clientes')
  const navegar = useNavigate()
  const { data: clientes = [], isLoading, error, refetch } = useClientes()
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [nuevo, setNuevo] = useState(false)

  const conteo = useMemo(() => {
    const c = { todos: clientes.length }
    for (const e of ESTADOS_CLIENTE) c[e.id] = clientes.filter((x) => x.estado === e.id).length
    return c
  }, [clientes])

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim())
    return clientes.filter((c) => {
      if (filtro !== 'todos' && c.estado !== filtro) return false
      if (!q) return true
      const texto = [c.nombre, c.email, c.telefono, c.rubro, ...(c.contactos ?? []).map((x) => x.nombre)].join(' ')
      return normalizar(texto).includes(q)
    })
  }, [clientes, busqueda, filtro])

  const chips = [{ id: 'todos', label: 'Todos' }, ...ESTADOS_CLIENTE]

  return (
    <>
      <Encabezado titulo="Clientes" subtitulo="Empresas y personas con las que trabajas, o podrías trabajar.">
        <Button icono={Plus} onClick={() => setNuevo(true)}>
          Nuevo cliente
        </Button>
      </Encabezado>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 basis-64 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" aria-hidden />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo, contacto…" className="pl-9" aria-label="Buscar clientes" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por estado">
          {chips.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFiltro(c.id)}
              aria-pressed={filtro === c.id}
              className={cx(
                'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                filtro === c.id ? 'border-acc bg-acc text-white' : 'border-line bg-white text-ink-2 hover:bg-paper',
              )}
            >
              {c.label} <span className={filtro === c.id ? 'text-white/80' : 'text-mute'}>{conteo[c.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Cargando />
      ) : error ? (
        <ErrorCarga error={error} onReintentar={refetch} />
      ) : clientes.length === 0 ? (
        <Card>
          <Vacio icono={Users} titulo="Aún no tienes clientes" texto="Crea el primero, o convierte una solicitud del sitio desde el CRM.">
            <Button icono={Plus} onClick={() => setNuevo(true)}>
              Crear cliente
            </Button>
          </Vacio>
        </Card>
      ) : visibles.length === 0 ? (
        <Card>
          <Vacio icono={Search} titulo="Sin resultados" texto="Prueba con otra búsqueda o cambia el filtro." />
        </Card>
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {visibles.map((c) => {
            const contacto = contactoPrincipal(c.contactos)
            const estado = ESTADO_CLIENTE[c.estado]
            const activos = (c.proyectos ?? []).filter((p) => ['planificado', 'en_curso', 'pausado'].includes(p.estado)).length
            const abiertas = (c.oportunidades ?? []).filter((o) => ['nuevo', 'contactado', 'diagnostico', 'propuesta'].includes(o.etapa)).length
            return (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="grid items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-paper/60 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)_minmax(0,11rem)_6.5rem]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar nombre={c.nombre} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.nombre}</p>
                    <p className="truncate text-xs text-mute">{c.rubro || (c.tipo === 'persona' ? 'Persona' : 'Empresa')}</p>
                  </div>
                </div>
                <div className="min-w-0 text-sm text-mute">
                  {contacto?.nombre && <p className="truncate text-ink-2">{contacto.nombre}</p>}
                  <p className="truncate">{c.email || c.telefono || 'Sin datos de contacto'}</p>
                </div>
                <p className="text-xs text-mute sm:text-right">
                  {activos > 0 && <span className="font-semibold text-ink-2">{activos} proyecto{activos === 1 ? '' : 's'} activo{activos === 1 ? '' : 's'}</span>}
                  {activos > 0 && abiertas > 0 && ' · '}
                  {abiertas > 0 && <span>{abiertas} oportunidad{abiertas === 1 ? '' : 'es'}</span>}
                </p>
                <Badge tono={estado.tono} className="justify-self-start sm:justify-self-end">
                  {estado.label}
                </Badge>
              </Link>
            )
          })}
        </Card>
      )}

      <ClienteFormModal abierto={nuevo} onCerrar={() => setNuevo(false)} onGuardado={(c) => navegar(`/clientes/${c.id}`)} />
    </>
  )
}
