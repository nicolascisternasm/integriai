-- Portal IntegriAI · base multi-organización con seguridad a nivel de fila (RLS)
-- Proyecto Supabase: uhgqtrsxszydcvhanmew (el mismo de la tabla `leads` del sitio).
--
-- Diseño:
--  · Cada fila de negocio lleva `organizacion_id`. Solo ve y edita quien es miembro de esa organización.
--  · La regla vive en la base (RLS), no en el código: aunque alguien tenga la clave pública del sitio,
--    sin una fila en `miembros` no ve nada.
--  · Las claves foráneas son compuestas (id, organizacion_id): una fila no puede apuntar a datos de otra organización.
--  · Las funciones de apoyo viven en el esquema `private`, que la API REST no expone.

create schema if not exists private;
grant usage on schema private to authenticated, supabase_auth_admin;

-- ═══════════════════════════ Organizaciones y equipo ═══════════════════════════

create table public.organizaciones (
  id               uuid primary key default gen_random_uuid(),
  nombre           text not null check (char_length(nombre) between 2 and 120),
  -- Módulos activos para esta organización (los ids deben existir en portal/src/modules/registry.js).
  modulos          text[] not null default array['crm','clientes','proyectos'],
  -- true solo para la organización dueña del sitio: recibe las solicitudes del formulario de diagnóstico.
  recibe_leads_web boolean not null default false,
  created_at       timestamptz not null default now()
);

create table public.miembros (
  organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
  usuario_id      uuid not null references auth.users(id) on delete cascade,
  rol             text not null default 'miembro' check (rol in ('propietario','admin','miembro')),
  nombre          text,
  created_at      timestamptz not null default now(),
  primary key (organizacion_id, usuario_id)
);
create index miembros_usuario_idx on public.miembros (usuario_id);

-- Acceso pendiente: cuando se crea (y confirma) un usuario con ese correo, entra solo a la organización.
create table public.invitaciones (
  id              uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
  email           text not null,
  rol             text not null default 'miembro' check (rol in ('propietario','admin','miembro')),
  nombre          text,
  created_at      timestamptz not null default now(),
  usada_at        timestamptz
);
create unique index invitaciones_pendiente_uq on public.invitaciones (lower(email)) where usada_at is null;
create index invitaciones_org_idx on public.invitaciones (organizacion_id);

-- ═══════════════════════════ Funciones de apoyo (privadas) ═══════════════════════════

create or replace function private.es_miembro(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.organizacion_id = org and m.usuario_id = (select auth.uid())
  );
$$;

create or replace function private.es_admin(org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros m
    where m.organizacion_id = org and m.usuario_id = (select auth.uid()) and m.rol in ('propietario','admin')
  );
$$;

create or replace function private.puede_ver_leads() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.miembros m
    join public.organizaciones o on o.id = m.organizacion_id
    where m.usuario_id = (select auth.uid()) and o.recibe_leads_web
  );
$$;

create or replace function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.es_miembro(uuid), private.es_admin(uuid), private.puede_ver_leads(), private.set_updated_at() from public, anon;
grant execute on function private.es_miembro(uuid), private.es_admin(uuid), private.puede_ver_leads(), private.set_updated_at() to authenticated;

-- ═══════════════════════════ Negocio ═══════════════════════════

create table public.clientes (
  id              uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
  nombre          text not null check (char_length(nombre) between 1 and 160),
  tipo            text not null default 'empresa' check (tipo in ('empresa','persona')),
  -- prospecto: aún no compra · activo: tiene o tuvo proyectos · inactivo: relación cerrada
  estado          text not null default 'prospecto' check (estado in ('prospecto','activo','inactivo')),
  rut             text,
  rubro           text,
  email           text,
  telefono        text,
  sitio_web       text,
  direccion       text,
  comuna          text,
  ciudad          text,
  notas           text,
  responsable_id  uuid references auth.users(id) on delete set null,
  creado_por      uuid references auth.users(id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, organizacion_id)
);
create index clientes_org_estado_idx on public.clientes (organizacion_id, estado);
create index clientes_org_nombre_idx on public.clientes (organizacion_id, lower(nombre));

create table public.contactos (
  id              uuid primary key default gen_random_uuid(),
  organizacion_id uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id      uuid not null,
  nombre          text not null check (char_length(nombre) between 1 and 160),
  cargo           text,
  email           text,
  telefono        text,
  es_principal    boolean not null default false,
  created_at      timestamptz not null default now(),
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete cascade
);
create index contactos_cliente_idx on public.contactos (cliente_id, organizacion_id);

create table public.oportunidades (
  id                     uuid primary key default gen_random_uuid(),
  organizacion_id        uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id             uuid not null,
  titulo                 text not null check (char_length(titulo) between 1 and 200),
  etapa                  text not null default 'nuevo'
                           check (etapa in ('nuevo','contactado','diagnostico','propuesta','ganado','perdido')),
  servicio               text,
  valor                  numeric(14,0) not null default 0 check (valor >= 0),
  fecha_cierre_estimada  date,
  motivo_perdida         text,
  origen                 text not null default 'manual',
  lead_id                uuid references public.leads(id) on delete set null,
  responsable_id         uuid references auth.users(id) on delete set null,
  notas                  text,
  cerrada_at             timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (id, organizacion_id),
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete cascade
);
create index oportunidades_org_etapa_idx on public.oportunidades (organizacion_id, etapa);
create index oportunidades_cliente_idx on public.oportunidades (cliente_id, organizacion_id);
create unique index oportunidades_lead_uq on public.oportunidades (lead_id) where lead_id is not null;

create table public.proyectos (
  id               uuid primary key default gen_random_uuid(),
  organizacion_id  uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id       uuid not null,
  oportunidad_id   uuid,
  nombre           text not null check (char_length(nombre) between 1 and 200),
  descripcion      text,
  servicio         text,
  estado           text not null default 'planificado'
                     check (estado in ('planificado','en_curso','pausado','entregado','cancelado')),
  fecha_inicio     date,
  fecha_entrega    date,
  entregado_at     date,
  monto            numeric(14,0) not null default 0 check (monto >= 0),
  url              text,
  responsable_id   uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, organizacion_id),
  -- Un cliente con proyectos no se puede borrar por accidente.
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete restrict,
  foreign key (oportunidad_id, organizacion_id) references public.oportunidades (id, organizacion_id) on delete set null (oportunidad_id)
);
create index proyectos_org_estado_idx on public.proyectos (organizacion_id, estado);
create index proyectos_cliente_idx on public.proyectos (cliente_id, organizacion_id);
create index proyectos_oportunidad_idx on public.proyectos (oportunidad_id, organizacion_id);

-- Tareas: sirven para seguimientos comerciales (cliente/oportunidad) y para el checklist de un proyecto.
create table public.tareas (
  id               uuid primary key default gen_random_uuid(),
  organizacion_id  uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id       uuid,
  oportunidad_id   uuid,
  proyecto_id      uuid,
  titulo           text not null check (char_length(titulo) between 1 and 300),
  estado           text not null default 'pendiente' check (estado in ('pendiente','en_progreso','hecha')),
  fecha_limite     date,
  responsable_id   uuid references auth.users(id) on delete set null,
  completada_at    timestamptz,
  created_at       timestamptz not null default now(),
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete cascade,
  foreign key (oportunidad_id, organizacion_id) references public.oportunidades (id, organizacion_id) on delete cascade,
  foreign key (proyecto_id, organizacion_id) references public.proyectos (id, organizacion_id) on delete cascade
);
create index tareas_org_estado_idx on public.tareas (organizacion_id, estado, fecha_limite);
create index tareas_cliente_idx on public.tareas (cliente_id, organizacion_id);
create index tareas_oportunidad_idx on public.tareas (oportunidad_id, organizacion_id);
create index tareas_proyecto_idx on public.tareas (proyecto_id, organizacion_id);

-- Historial: notas, llamadas, reuniones y cambios de etapa. En un proyecto hace de bitácora.
create table public.actividades (
  id               uuid primary key default gen_random_uuid(),
  organizacion_id  uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id       uuid not null,
  oportunidad_id   uuid,
  proyecto_id      uuid,
  tipo             text not null default 'nota'
                     check (tipo in ('nota','llamada','whatsapp','reunion','email','etapa','sistema')),
  detalle          text not null check (char_length(detalle) between 1 and 5000),
  usuario_id       uuid references auth.users(id) on delete set null default auth.uid(),
  usuario_nombre   text,
  created_at       timestamptz not null default now(),
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete cascade,
  foreign key (oportunidad_id, organizacion_id) references public.oportunidades (id, organizacion_id) on delete set null (oportunidad_id),
  foreign key (proyecto_id, organizacion_id) references public.proyectos (id, organizacion_id) on delete set null (proyecto_id)
);
create index actividades_cliente_idx on public.actividades (cliente_id, organizacion_id, created_at desc);
create index actividades_oportunidad_idx on public.actividades (oportunidad_id, organizacion_id);
create index actividades_proyecto_idx on public.actividades (proyecto_id, organizacion_id);

-- Cobros: hitos de pago de un proyecto.
create table public.cobros (
  id                 uuid primary key default gen_random_uuid(),
  organizacion_id    uuid not null references public.organizaciones(id) on delete cascade,
  proyecto_id        uuid not null,
  concepto           text not null check (char_length(concepto) between 1 and 200),
  monto              numeric(14,0) not null check (monto > 0),
  fecha_vencimiento  date,
  estado             text not null default 'pendiente' check (estado in ('pendiente','pagado')),
  pagado_at          date,
  documento          text,
  created_at         timestamptz not null default now(),
  foreign key (proyecto_id, organizacion_id) references public.proyectos (id, organizacion_id) on delete cascade
);
create index cobros_proyecto_idx on public.cobros (proyecto_id, organizacion_id);
create index cobros_org_estado_idx on public.cobros (organizacion_id, estado, fecha_vencimiento);

create trigger clientes_updated_at before update on public.clientes for each row execute function private.set_updated_at();
create trigger oportunidades_updated_at before update on public.oportunidades for each row execute function private.set_updated_at();
create trigger proyectos_updated_at before update on public.proyectos for each row execute function private.set_updated_at();

-- ═══════════════════════════ Reglas del embudo ═══════════════════════════

-- Marca la fecha de cierre al ganar o perder una oportunidad.
create or replace function private.oportunidad_cierre() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' or new.etapa is distinct from old.etapa then
    if new.etapa in ('ganado','perdido') then
      new.cerrada_at := coalesce(new.cerrada_at, now());
    else
      new.cerrada_at := null;
    end if;
  end if;
  return new;
end;
$$;

-- Al ganar: el prospecto pasa a cliente activo. Si viene del sitio, la solicitud refleja la misma etapa.
-- Corre con los permisos de quien edita (RLS aplica), no con permisos elevados.
create or replace function private.oportunidad_sincronizar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.etapa = 'ganado' then
    update public.clientes set estado = 'activo'
    where id = new.cliente_id and organizacion_id = new.organizacion_id and estado = 'prospecto';
  end if;
  if new.lead_id is not null then
    update public.leads set estado = new.etapa where id = new.lead_id and estado is distinct from new.etapa;
  end if;
  return null;
end;
$$;

revoke all on function private.oportunidad_cierre(), private.oportunidad_sincronizar() from public, anon;
grant execute on function private.oportunidad_cierre(), private.oportunidad_sincronizar() to authenticated;

create trigger oportunidades_cierre before insert or update of etapa on public.oportunidades
  for each row execute function private.oportunidad_cierre();
create trigger oportunidades_sincronizar after insert or update of etapa on public.oportunidades
  for each row execute function private.oportunidad_sincronizar();

-- ═══════════════════════════ Seguridad (RLS) ═══════════════════════════

alter table public.organizaciones enable row level security;
alter table public.miembros       enable row level security;
alter table public.invitaciones   enable row level security;

revoke all on public.organizaciones, public.miembros, public.invitaciones from anon, authenticated;
grant select on public.organizaciones, public.miembros to authenticated;
-- Solo el nombre se edita desde la app; módulos, rol y leads los define IntegriAI.
grant update (nombre) on public.organizaciones to authenticated;
grant update (nombre) on public.miembros to authenticated;
-- invitaciones: sin acceso desde la app (se gestionan con SQL / funciones de servidor).

create policy "miembros ven su organizacion" on public.organizaciones
  for select to authenticated using (private.es_miembro(id));
create policy "admins editan su organizacion" on public.organizaciones
  for update to authenticated using (private.es_admin(id)) with check (private.es_admin(id));

create policy "ver equipo propio" on public.miembros
  for select to authenticated using (usuario_id = (select auth.uid()) or private.es_admin(organizacion_id));
create policy "editar mi nombre" on public.miembros
  for update to authenticated using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['clientes','contactos','oportunidades','proyectos','tareas','actividades','cobros'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "miembros leen" on public.%I for select to authenticated using (private.es_miembro(organizacion_id))', t);
    execute format('create policy "miembros crean" on public.%I for insert to authenticated with check (private.es_miembro(organizacion_id))', t);
    execute format('create policy "miembros editan" on public.%I for update to authenticated using (private.es_miembro(organizacion_id)) with check (private.es_miembro(organizacion_id))', t);
    if t in ('clientes','proyectos','cobros') then
      execute format('create policy "admins eliminan" on public.%I for delete to authenticated using (private.es_admin(organizacion_id))', t);
    else
      execute format('create policy "miembros eliminan" on public.%I for delete to authenticated using (private.es_miembro(organizacion_id))', t);
    end if;
  end loop;
end $$;

-- Solicitudes del sitio (tabla `leads`): el sitio sigue pudiendo solo insertar (política existente para `anon`).
-- El equipo de la organización dueña del sitio puede leerlas y cambiar su estado y notas.
revoke all on public.leads from authenticated;
grant select on public.leads to authenticated;
grant update (estado, notas) on public.leads to authenticated;
create policy "equipo lee solicitudes" on public.leads
  for select to authenticated using (private.puede_ver_leads());
create policy "equipo actualiza solicitudes" on public.leads
  for update to authenticated using (private.puede_ver_leads()) with check (private.puede_ver_leads());

-- ═══════════════════════════ Convertir una solicitud web en cliente + oportunidad ═══════════════════════════

create or replace function public.convertir_lead(p_lead uuid, p_organizacion uuid) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  l         public.leads%rowtype;
  v_cliente uuid;
  v_op      uuid;
  v_empresa text;
  v_detalle text;
begin
  select * into l from public.leads where id = p_lead;
  if not found then
    raise exception 'Solicitud no encontrada';
  end if;
  if exists (select 1 from public.oportunidades where lead_id = p_lead) then
    raise exception 'Esta solicitud ya fue convertida';
  end if;

  v_empresa := nullif(trim(coalesce(l.empresa, '')), '');

  -- Si ya existe un cliente con el mismo correo, se reutiliza.
  if l.email is not null and trim(l.email) <> '' then
    select id into v_cliente from public.clientes
    where organizacion_id = p_organizacion and lower(email) = lower(trim(l.email)) limit 1;
  end if;

  if v_cliente is null then
    insert into public.clientes (organizacion_id, nombre, tipo, estado, rubro, email, telefono)
    values (p_organizacion, coalesce(v_empresa, l.nombre), case when v_empresa is null then 'persona' else 'empresa' end,
            'prospecto', nullif(trim(coalesce(l.rubro, '')), ''), nullif(trim(coalesce(l.email, '')), ''), nullif(trim(coalesce(l.whatsapp, '')), ''))
    returning id into v_cliente;

    insert into public.contactos (organizacion_id, cliente_id, nombre, email, telefono, es_principal)
    values (p_organizacion, v_cliente, l.nombre, nullif(trim(coalesce(l.email, '')), ''), nullif(trim(coalesce(l.whatsapp, '')), ''), true);
  end if;

  insert into public.oportunidades (organizacion_id, cliente_id, titulo, etapa, servicio, origen, lead_id)
  values (p_organizacion, v_cliente, 'Solicitud web de ' || coalesce(v_empresa, l.nombre), 'nuevo',
          nullif(trim(coalesce(l.servicio, '')), ''), 'web', l.id)
  returning id into v_op;

  v_detalle := concat_ws(E'\n',
    'Solicitud recibida por el formulario de diagnóstico del sitio.',
    case when nullif(trim(coalesce(l.servicio, '')), '')      is not null then 'Servicio de interés: ' || l.servicio end,
    case when nullif(trim(coalesce(l.rubro, '')), '')         is not null then 'Rubro: ' || l.rubro end,
    case when nullif(trim(coalesce(l.dificultades, '')), '')  is not null then 'Dificultades: ' || l.dificultades end,
    case when nullif(trim(coalesce(l.tareas_manuales, '')), '') is not null then 'Tareas manuales: ' || l.tareas_manuales end,
    case when nullif(trim(coalesce(l.sistemas, '')), '')      is not null then 'Sistemas actuales: ' || l.sistemas end,
    case when nullif(trim(coalesce(l.procesos, '')), '')      is not null then 'Procesos: ' || l.procesos end,
    case when nullif(trim(coalesce(l.pagina_origen, '')), '') is not null then 'Página de origen: ' || l.pagina_origen end
  );

  insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
  values (p_organizacion, v_cliente, v_op, 'sistema', v_detalle, 'Sitio web');

  return v_op;
end;
$$;

revoke all on function public.convertir_lead(uuid, uuid) from public, anon;
grant execute on function public.convertir_lead(uuid, uuid) to authenticated;

-- ═══════════════════════════ Alta del equipo por invitación ═══════════════════════════

-- Cuando se crea (o se confirma) un usuario cuyo correo tiene una invitación pendiente, entra a la organización.
-- Solo se otorga con el correo confirmado, para que nadie pueda reclamar un acceso registrando el correo de otro.
create or replace function private.aceptar_invitacion() returns trigger
language plpgsql security definer set search_path = '' as $$
declare inv public.invitaciones%rowtype;
begin
  if new.email_confirmed_at is null or new.email is null then
    return new;
  end if;
  select * into inv from public.invitaciones
  where lower(email) = lower(new.email) and usada_at is null
  limit 1;
  if found then
    insert into public.miembros (organizacion_id, usuario_id, rol, nombre)
    values (inv.organizacion_id, new.id, inv.rol, coalesce(inv.nombre, split_part(new.email, '@', 1)))
    on conflict do nothing;
    update public.invitaciones set usada_at = now() where id = inv.id;
  end if;
  return new;
end;
$$;

revoke all on function private.aceptar_invitacion() from public, anon, authenticated;
grant execute on function private.aceptar_invitacion() to supabase_auth_admin;

create trigger portal_aceptar_invitacion_insert after insert on auth.users
  for each row execute function private.aceptar_invitacion();
create trigger portal_aceptar_invitacion_confirmacion after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function private.aceptar_invitacion();

-- ═══════════════════════════ Datos iniciales ═══════════════════════════

insert into public.organizaciones (nombre, modulos, recibe_leads_web)
values ('IntegriAI', array['crm','clientes','proyectos'], true);
