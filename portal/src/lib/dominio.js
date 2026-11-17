import { StickyNote, Phone, MessageCircle, Users, Mail, ArrowRightLeft, Bot } from 'lucide-react'

// Colores de las etiquetas (clases completas para que Tailwind las detecte).
export const TONOS = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-50 text-blue-700',
  violet: 'bg-acc-50 text-acc-strong',
  amber: 'bg-amber-50 text-amber-800',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
}

// Embudo comercial. Los ids coinciden con el estado de las solicitudes del sitio (tabla `leads`).
export const ETAPAS = [
  { id: 'nuevo', label: 'Nuevo', tono: 'slate', punto: 'bg-slate-400' },
  { id: 'contactado', label: 'Contactado', tono: 'blue', punto: 'bg-blue-500' },
  { id: 'diagnostico', label: 'Diagnóstico', tono: 'violet', punto: 'bg-acc' },
  { id: 'propuesta', label: 'Propuesta', tono: 'amber', punto: 'bg-amber-500' },
  { id: 'ganado', label: 'Ganado', tono: 'green', punto: 'bg-emerald-500' },
  { id: 'perdido', label: 'Perdido', tono: 'red', punto: 'bg-red-500' },
]
export const ETAPA = Object.fromEntries(ETAPAS.map((e) => [e.id, e]))
export const ETAPAS_ABIERTAS = ['nuevo', 'contactado', 'diagnostico', 'propuesta']

export const ESTADOS_CLIENTE = [
  { id: 'prospecto', label: 'Prospecto', tono: 'amber' },
  { id: 'activo', label: 'Cliente activo', tono: 'green' },
  { id: 'inactivo', label: 'Inactivo', tono: 'slate' },
]
export const ESTADO_CLIENTE = Object.fromEntries(ESTADOS_CLIENTE.map((e) => [e.id, e]))

export const ESTADOS_PROYECTO = [
  { id: 'planificado', label: 'Planificado', tono: 'slate' },
  { id: 'en_curso', label: 'En curso', tono: 'blue' },
  { id: 'pausado', label: 'Pausado', tono: 'amber' },
  { id: 'entregado', label: 'Entregado', tono: 'green' },
  { id: 'cancelado', label: 'Cancelado', tono: 'red' },
]
export const ESTADO_PROYECTO = Object.fromEntries(ESTADOS_PROYECTO.map((e) => [e.id, e]))
export const PROYECTO_ACTIVO = ['planificado', 'en_curso', 'pausado']

// Mismos valores que el selector del formulario de diagnóstico del sitio.
export const SERVICIOS = [
  { id: 'sistemas', label: 'Sistema de gestión, ERP o CRM' },
  { id: 'automatizacion', label: 'Automatización de procesos' },
  { id: 'agentes-ia', label: 'Agente de IA o WhatsApp' },
  { id: 'web', label: 'Web o tienda online' },
  { id: 'otro', label: 'Otro' },
  { id: 'no-se', label: 'Por definir' },
]
export const servicioLabel = (id) => SERVICIOS.find((s) => s.id === id)?.label ?? id ?? '—'

export const TIPOS_ACTIVIDAD = [
  { id: 'nota', label: 'Nota', icono: StickyNote },
  { id: 'llamada', label: 'Llamada', icono: Phone },
  { id: 'whatsapp', label: 'WhatsApp', icono: MessageCircle },
  { id: 'reunion', label: 'Reunión', icono: Users },
  { id: 'email', label: 'Correo', icono: Mail },
  { id: 'etapa', label: 'Cambio de etapa', icono: ArrowRightLeft },
  { id: 'sistema', label: 'Sistema', icono: Bot },
]
export const TIPO_ACTIVIDAD = Object.fromEntries(TIPOS_ACTIVIDAD.map((t) => [t.id, t]))
export const TIPOS_MANUALES = TIPOS_ACTIVIDAD.filter((t) => !['etapa', 'sistema'].includes(t.id))

export const ORIGENES = { manual: 'Manual', web: 'Sitio web', referido: 'Referido', redes: 'Redes sociales' }
export const ROLES = { propietario: 'Propietario', admin: 'Administrador', miembro: 'Miembro' }
