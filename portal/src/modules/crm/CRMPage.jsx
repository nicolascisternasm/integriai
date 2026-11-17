import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { useSolicitudes } from '../../api/leads.js'
import { useTareasPendientes } from '../../api/tareas.js'
import { Encabezado, Pestanas } from '../../components/ui.jsx'
import { useTitulo } from '../../lib/useTitulo.js'
import Embudo from './Embudo.jsx'
import Seguimientos from './Seguimientos.jsx'
import Solicitudes from './Solicitudes.jsx'

export default function CRMPage() {
  useTitulo('CRM')
  const { org } = useAuth()
  const [params, setParams] = useSearchParams()
  const ve = org.recibe_leads_web
  const { data: solicitudes = [] } = useSolicitudes(ve)
  const { data: tareas = [] } = useTareasPendientes()

  const nuevas = solicitudes.filter((l) => !l.convertida && l.estado === 'nuevo').length
  const pestanas = [
    { id: 'embudo', label: 'Embudo' },
    ...(ve ? [{ id: 'solicitudes', label: 'Solicitudes del sitio', n: nuevas }] : []),
    { id: 'seguimientos', label: 'Seguimientos', n: tareas.length },
  ]
  const pedida = params.get('tab')
  const tab = pestanas.some((p) => p.id === pedida) ? pedida : 'embudo'

  return (
    <>
      <Encabezado titulo="CRM" subtitulo="Desde que alguien te escribe hasta que se cierra la venta." />
      <Pestanas pestanas={pestanas} activa={tab} onCambiar={(t) => setParams(t === 'embudo' ? {} : { tab: t }, { replace: true })} />
      {tab === 'embudo' && <Embudo />}
      {tab === 'solicitudes' && <Solicitudes />}
      {tab === 'seguimientos' && <Seguimientos />}
    </>
  )
}
