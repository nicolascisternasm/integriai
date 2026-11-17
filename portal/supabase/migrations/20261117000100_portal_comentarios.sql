-- Comentarios de las tablas del portal (documentación dentro de la propia base).

comment on table public.organizaciones is 'Empresas que usan el portal. `modulos` activa módulos (ver portal/src/modules/registry.js); `recibe_leads_web` marca a la organización dueña del sitio.';
comment on table public.miembros is 'Quién pertenece a qué organización y con qué rol. Es la base de toda la seguridad (RLS): sin una fila aquí, un usuario no ve nada.';
comment on table public.invitaciones is 'Accesos pendientes por correo. SIN políticas RLS a propósito: no es accesible desde la API pública; se gestiona con SQL o funciones de servidor. Al crearse (y confirmarse) un usuario con ese correo, entra solo a la organización.';
comment on table public.clientes is 'Clientes y prospectos. estado: prospecto (aún no compra), activo (tiene o tuvo proyectos), inactivo.';
comment on table public.contactos is 'Personas de contacto de un cliente. Una sola puede ser principal.';
comment on table public.oportunidades is 'Posibles ventas en el embudo (nuevo → contactado → diagnóstico → propuesta → ganado/perdido). Si vienen del sitio, lead_id apunta a la solicitud.';
comment on table public.proyectos is 'Trabajo que se hace para un cliente. El avance se calcula con las tareas completadas.';
comment on table public.tareas is 'Seguimientos comerciales (cliente/oportunidad) y checklist de proyecto.';
comment on table public.actividades is 'Historial de un cliente: notas, llamadas, reuniones, cambios de etapa. En un proyecto hace de bitácora.';
comment on table public.cobros is 'Hitos de pago de un proyecto.';
comment on function public.convertir_lead(uuid, uuid) is 'Convierte una solicitud del sitio (leads) en cliente prospecto + contacto + oportunidad, en una sola operación. SECURITY INVOKER: respeta RLS.';
