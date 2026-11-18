-- Cotizaciones + interfaz del agente cotizador.
--
-- 1) Tabla `cotizaciones` (con número correlativo COT-AAAA-NNN, vigencia y estado). Cambiar su estado mueve la
--    oportunidad en el embudo: enviada → Propuesta, aceptada → Ganado.
-- 2) Esquema `agente`: funciones que usa el agente cotizador (un Proyecto de Claude con el conector de Supabase)
--    para registrar prospectos, movimientos, cotizaciones y tareas. El esquema NO está expuesto por la API pública
--    (anon/authenticated no pueden llamarlo): solo se llega con acceso directo a SQL (conector de Supabase / panel).
--    Las funciones validan, evitan duplicados, nunca borran y firman todo como "Agente cotizador".

-- ═══════════════════════════ Cotizaciones ═══════════════════════════

create table public.cotizaciones (
  id               uuid primary key default gen_random_uuid(),
  organizacion_id  uuid not null references public.organizaciones(id) on delete cascade,
  cliente_id       uuid not null,
  oportunidad_id   uuid,
  numero           text not null default '',   -- si va vacío, un trigger asigna COT-AAAA-NNN
  fecha            date not null default current_date,
  vigencia_hasta   date,                       -- si va vacío: fecha + 15 días
  plan             text,
  semaforo         text check (semaforo in ('verde','amarillo','rojo')),
  neto             numeric(14,0) not null default 0 check (neto >= 0),
  mensual          numeric(14,0) not null default 0 check (mensual >= 0),
  estado           text not null default 'borrador' check (estado in ('borrador','enviada','aceptada','rechazada','vencida')),
  resumen          text,
  documento_url    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (id, organizacion_id),
  unique (organizacion_id, numero),
  foreign key (cliente_id, organizacion_id) references public.clientes (id, organizacion_id) on delete cascade,
  foreign key (oportunidad_id, organizacion_id) references public.oportunidades (id, organizacion_id) on delete set null (oportunidad_id)
);
create index cotizaciones_oportunidad_idx on public.cotizaciones (oportunidad_id, organizacion_id);
create index cotizaciones_cliente_idx on public.cotizaciones (cliente_id, organizacion_id);
create index cotizaciones_org_estado_idx on public.cotizaciones (organizacion_id, estado, vigencia_hasta);

create trigger cotizaciones_updated_at before update on public.cotizaciones for each row execute function private.set_updated_at();

create or replace function private.etapa_label(e text) returns text
language sql immutable set search_path = '' as $$
  select case e when 'nuevo' then 'Nuevo' when 'contactado' then 'Contactado' when 'diagnostico' then 'Diagnóstico'
                when 'propuesta' then 'Propuesta' when 'ganado' then 'Ganado' when 'perdido' then 'Perdido' else e end;
$$;

-- Número correlativo por organización y año, y vigencia por defecto de 15 días.
create or replace function private.cotizacion_numero() returns trigger
language plpgsql set search_path = '' as $$
declare
  v_anio text;
  v_sig  int;
begin
  if coalesce(trim(new.numero), '') = '' then
    perform pg_advisory_xact_lock(hashtextextended('cotizacion:' || new.organizacion_id::text, 0));
    v_anio := to_char(new.fecha, 'YYYY');
    select coalesce(max((substring(c.numero from '^COT-' || v_anio || '-(\d+)$'))::int), 0) + 1
      into v_sig
      from public.cotizaciones c
     where c.organizacion_id = new.organizacion_id;
    new.numero := 'COT-' || v_anio || '-' || lpad(v_sig::text, 3, '0');
  end if;
  if new.vigencia_hasta is null then
    new.vigencia_hasta := new.fecha + 15;
  end if;
  return new;
end;
$$;

-- El estado de la cotización mueve la oportunidad y deja constancia en el historial.
create or replace function private.cotizacion_sincronizar() returns trigger
language plpgsql set search_path = '' as $$
declare
  op     public.oportunidades%rowtype;
  actor  text;
  nueva  text;
begin
  if tg_op = 'UPDATE' and old.estado = new.estado and old.neto = new.neto then
    return null;
  end if;
  if new.oportunidad_id is null then
    return null;
  end if;
  select * into op from public.oportunidades where id = new.oportunidad_id and organizacion_id = new.organizacion_id;
  if not found then
    return null;
  end if;

  actor := coalesce(
    nullif(current_setting('app.actor', true), ''),
    (select m.nombre from public.miembros m where m.usuario_id = (select auth.uid()) and m.organizacion_id = new.organizacion_id limit 1),
    'Sistema'
  );

  -- El valor de la oportunidad sigue a la cotización que está en juego.
  if new.estado in ('enviada', 'aceptada') and op.valor is distinct from new.neto then
    update public.oportunidades set valor = new.neto where id = op.id;
  end if;

  if new.estado = 'enviada' and op.etapa in ('nuevo', 'contactado', 'diagnostico') then
    nueva := 'propuesta';
  elsif new.estado = 'aceptada' and op.etapa <> 'ganado' then
    nueva := 'ganado';
  end if;

  if nueva is not null then
    update public.oportunidades set etapa = nueva, motivo_perdida = null where id = op.id;
    insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
    values (new.organizacion_id, new.cliente_id, op.id, 'etapa',
            private.etapa_label(op.etapa) || ' → ' || private.etapa_label(nueva) || ' · Cotización ' || new.numero || ' ' || new.estado,
            actor);
  end if;
  return null;
end;
$$;

revoke all on function private.etapa_label(text), private.cotizacion_numero(), private.cotizacion_sincronizar() from public, anon;
grant execute on function private.etapa_label(text), private.cotizacion_numero(), private.cotizacion_sincronizar() to authenticated;

create trigger cotizaciones_numero before insert on public.cotizaciones
  for each row execute function private.cotizacion_numero();
create trigger cotizaciones_sincronizar after insert or update of estado, neto on public.cotizaciones
  for each row execute function private.cotizacion_sincronizar();

alter table public.cotizaciones enable row level security;
revoke all on public.cotizaciones from anon;
grant select, insert, update, delete on public.cotizaciones to authenticated;
create policy "miembros leen" on public.cotizaciones for select to authenticated using (private.es_miembro(organizacion_id));
create policy "miembros crean" on public.cotizaciones for insert to authenticated with check (private.es_miembro(organizacion_id));
create policy "miembros editan" on public.cotizaciones for update to authenticated using (private.es_miembro(organizacion_id)) with check (private.es_miembro(organizacion_id));
create policy "admins eliminan" on public.cotizaciones for delete to authenticated using (private.es_admin(organizacion_id));

comment on table public.cotizaciones is 'Cotizaciones enviadas a clientes. Número COT-AAAA-NNN automático, vigencia 15 días por defecto. Su estado mueve la oportunidad (enviada → Propuesta, aceptada → Ganado).';

-- ═══════════════════════════ Esquema del agente ═══════════════════════════

create schema if not exists agente;
comment on schema agente is 'Interfaz del agente cotizador. No expuesto por la API pública. Ver agente.ayuda().';

create or replace function agente._org() returns uuid
language sql stable set search_path = '' as $$
  select id from public.organizaciones where recibe_leads_web order by created_at limit 1;
$$;

create or replace function agente._dominio(p text) returns text
language sql immutable set search_path = '' as $$
  select nullif(regexp_replace(regexp_replace(lower(trim(coalesce(p, ''))), '^https?://', ''), '^www\.|/.*$', '', 'g'), '');
$$;

create or replace function agente.ayuda() returns jsonb
language sql stable set search_path = '' as $f$
  select jsonb_build_object(
    'descripcion', 'Funciones del agente cotizador de IntegriAI. Se llaman con: select agente.<funcion>(...);',
    'reglas', jsonb_build_array(
      'Solo usa funciones del esquema agente. No ejecutes DDL, DELETE ni UPDATE directos sobre las tablas.',
      'Antes de crear algo, busca con agente.buscar() para no duplicar. registrar_prospecto ya evita duplicados.',
      'Nunca se borra nada: una oportunidad que no avanza se marca etapa perdido con motivo.',
      'Etapas: nuevo, contactado, diagnostico, propuesta, ganado, perdido.',
      'Servicios: sistemas, automatizacion, agentes-ia, web, otro, no-se.',
      'Cotización enviada mueve la oportunidad a propuesta; aceptada la mueve a ganado.'
    ),
    'funciones', jsonb_build_array(
      jsonb_build_object('llamada', 'select agente.buscar(''texto o null'', false);', 'sirve_para', 'Lista oportunidades abiertas (true en el 2º parámetro incluye cerradas) con último movimiento, tareas y última cotización. Filtra por empresa, correo, web o título.'),
      jsonb_build_object('llamada', 'select agente.detalle(''<oportunidad_id>'');', 'sirve_para', 'Ficha completa: cliente, contactos, cotizaciones, tareas abiertas e historial.'),
      jsonb_build_object('llamada', 'select agente.registrar_prospecto(p_empresa => ''..'', p_rubro => ''..'', p_web => ''..'', p_email => ''..'', p_telefono => ''..'', p_comuna => ''..'', p_senales => ''..'', p_problemas => ''..'');', 'sirve_para', 'Registra una empresa nueva (cliente prospecto + oportunidad en etapa nuevo). Si ya existe devuelve ya_existia = true y no crea nada.'),
      jsonb_build_object('llamada', 'select agente.registrar_movimiento(p_oportunidad => ''<id>'', p_tipo => ''email'', p_detalle => ''..'', p_etapa => ''contactado'');', 'sirve_para', 'Anota un contacto (tipo: nota, llamada, whatsapp, reunion, email) y opcionalmente cambia la etapa (p_motivo si es perdido; p_fecha para fechas pasadas).'),
      jsonb_build_object('llamada', 'select agente.registrar_cotizacion(p_oportunidad => ''<id>'', p_plan => ''Plan Medio'', p_neto => 590000, p_semaforo => ''verde'', p_resumen => ''..'', p_estado => ''enviada'');', 'sirve_para', 'Guarda una cotización con número COT-AAAA-NNN automático y vigencia de 15 días. p_mensual = plan mensual neto.'),
      jsonb_build_object('llamada', 'select agente.actualizar_cotizacion(p_numero => ''COT-2026-001'', p_estado => ''aceptada'', p_nota => ''..'');', 'sirve_para', 'Cambia estado (borrador, enviada, aceptada, rechazada, vencida) o monto, y deja una nota.'),
      jsonb_build_object('llamada', 'select agente.crear_tarea(p_oportunidad => ''<id>'', p_titulo => ''..'', p_fecha => ''2026-11-25'');', 'sirve_para', 'Crea un seguimiento que aparece en CRM > Seguimientos y en el inicio del portal.'),
      jsonb_build_object('llamada', 'select agente.completar_tarea(''<tarea_id>'');', 'sirve_para', 'Marca un seguimiento como hecho.')
    )
  );
$f$;

create or replace function agente.buscar(p_texto text default null, p_incluir_cerradas boolean default false) returns jsonb
language sql stable set search_path = '' as $$
  select coalesce(jsonb_agg(to_jsonb(r) order by r.actualizado desc), '[]'::jsonb)
  from (
    select o.id as oportunidad_id, c.id as cliente_id, c.nombre as empresa, c.rubro, c.email, c.telefono, c.sitio_web,
           o.titulo, o.etapa, o.valor, o.origen, c.estado as estado_cliente, o.updated_at as actualizado,
           (select jsonb_build_object('fecha', a.created_at, 'tipo', a.tipo, 'detalle', left(a.detalle, 160))
              from public.actividades a where a.oportunidad_id = o.id order by a.created_at desc limit 1) as ultimo_movimiento,
           (select count(*) from public.tareas t where t.oportunidad_id = o.id and t.estado <> 'hecha') as tareas_abiertas,
           (select jsonb_build_object('numero', q.numero, 'estado', q.estado, 'neto', q.neto, 'vigencia_hasta', q.vigencia_hasta)
              from public.cotizaciones q where q.oportunidad_id = o.id order by q.created_at desc limit 1) as ultima_cotizacion
    from public.oportunidades o
    join public.clientes c on c.id = o.cliente_id and c.organizacion_id = o.organizacion_id
    where o.organizacion_id = agente._org()
      and (p_incluir_cerradas or o.etapa not in ('ganado', 'perdido'))
      and (coalesce(p_texto, '') = ''
           or c.nombre ilike '%' || p_texto || '%' or c.email ilike '%' || p_texto || '%'
           or c.sitio_web ilike '%' || p_texto || '%' or o.titulo ilike '%' || p_texto || '%')
    order by o.updated_at desc
    limit 80
  ) r;
$$;

create or replace function agente.detalle(p_oportunidad uuid) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'oportunidad', to_jsonb(o) - 'organizacion_id',
    'cliente', to_jsonb(c) - 'organizacion_id' - 'creado_por' - 'responsable_id',
    'contactos', (select coalesce(jsonb_agg(to_jsonb(k) - 'organizacion_id' order by k.es_principal desc), '[]'::jsonb)
                    from public.contactos k where k.cliente_id = c.id),
    'cotizaciones', (select coalesce(jsonb_agg(to_jsonb(q) - 'organizacion_id' order by q.created_at desc), '[]'::jsonb)
                       from public.cotizaciones q where q.oportunidad_id = o.id),
    'tareas_abiertas', (select coalesce(jsonb_agg(jsonb_build_object('id', t.id, 'titulo', t.titulo, 'fecha_limite', t.fecha_limite, 'estado', t.estado) order by t.fecha_limite nulls last), '[]'::jsonb)
                          from public.tareas t where t.oportunidad_id = o.id and t.estado <> 'hecha'),
    'historial', (select coalesce(jsonb_agg(h), '[]'::jsonb)
                    from (select a.created_at, a.tipo, a.usuario_nombre, a.detalle
                            from public.actividades a where a.oportunidad_id = o.id order by a.created_at desc limit 25) h)
  )
  from public.oportunidades o
  join public.clientes c on c.id = o.cliente_id and c.organizacion_id = o.organizacion_id
  where o.id = p_oportunidad and o.organizacion_id = agente._org();
$$;

create or replace function agente.registrar_prospecto(
  p_empresa   text,
  p_rubro     text default null,
  p_web       text default null,
  p_email     text default null,
  p_telefono  text default null,
  p_comuna    text default null,
  p_contacto  text default null,
  p_senales   text default null,
  p_problemas text default null,
  p_servicio  text default 'web',
  p_origen    text default 'prospeccion',
  p_titulo    text default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org   uuid := agente._org();
  v_emp   text := nullif(trim(coalesce(p_empresa, '')), '');
  v_dom   text := agente._dominio(p_web);
  v_mail  text := nullif(lower(trim(coalesce(p_email, ''))), '');
  v_tel   text := nullif(trim(coalesce(p_telefono, '')), '');
  v_cli   uuid;
  v_op    uuid;
  v_texto text;
begin
  perform set_config('app.actor', 'Agente cotizador', true);
  if v_org is null then raise exception 'No hay organización configurada'; end if;
  if v_emp is null or char_length(v_emp) < 2 then raise exception 'p_empresa es obligatorio'; end if;
  if p_servicio not in ('sistemas', 'automatizacion', 'agentes-ia', 'web', 'otro', 'no-se') then
    raise exception 'p_servicio inválido: % (usa sistemas, automatizacion, agentes-ia, web, otro, no-se)', p_servicio;
  end if;

  select c.id into v_cli
    from public.clientes c
   where c.organizacion_id = v_org
     and (lower(c.nombre) = lower(v_emp)
          or (v_mail is not null and lower(c.email) = v_mail)
          or (v_dom is not null and agente._dominio(c.sitio_web) = v_dom))
   limit 1;

  if v_cli is not null then
    return jsonb_build_object(
      'ya_existia', true,
      'cliente_id', v_cli,
      'oportunidades', (select coalesce(jsonb_agg(jsonb_build_object('oportunidad_id', o.id, 'titulo', o.titulo, 'etapa', o.etapa)), '[]'::jsonb)
                          from public.oportunidades o where o.cliente_id = v_cli and o.organizacion_id = v_org),
      'mensaje', 'Ya estaba registrada. No se creó nada nuevo.');
  end if;

  insert into public.clientes (organizacion_id, nombre, tipo, estado, rubro, email, telefono, sitio_web, comuna)
  values (v_org, v_emp, 'empresa', 'prospecto', nullif(trim(coalesce(p_rubro, '')), ''), v_mail, v_tel,
          case when v_dom is null then null else 'https://' || v_dom end, nullif(trim(coalesce(p_comuna, '')), ''))
  returning id into v_cli;

  if nullif(trim(coalesce(p_contacto, '')), '') is not null then
    insert into public.contactos (organizacion_id, cliente_id, nombre, email, telefono, es_principal)
    values (v_org, v_cli, trim(p_contacto), v_mail, v_tel, true);
  end if;

  insert into public.oportunidades (organizacion_id, cliente_id, titulo, etapa, servicio, origen)
  values (v_org, v_cli,
          coalesce(nullif(trim(coalesce(p_titulo, '')), ''),
                   case p_servicio when 'web' then 'Diagnóstico y mejora web de ' else 'Oportunidad con ' end || v_emp),
          'nuevo', p_servicio, coalesce(nullif(trim(coalesce(p_origen, '')), ''), 'prospeccion'))
  returning id into v_op;

  v_texto := concat_ws(E'\n',
    'Prospecto encontrado por el agente cotizador.',
    case when nullif(trim(coalesce(p_senales, '')), '') is not null then 'Señales de movimiento: ' || trim(p_senales) end,
    case when nullif(trim(coalesce(p_problemas, '')), '') is not null then 'Problemas detectados: ' || trim(p_problemas) end);

  insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
  values (v_org, v_cli, v_op, 'sistema', left(v_texto, 5000), 'Agente cotizador');

  return jsonb_build_object('ya_existia', false, 'cliente_id', v_cli, 'oportunidad_id', v_op);
end;
$$;

create or replace function agente.registrar_movimiento(
  p_oportunidad uuid,
  p_tipo        text,
  p_detalle     text,
  p_etapa       text default null,
  p_motivo      text default null,
  p_fecha       timestamptz default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org   uuid := agente._org();
  op      public.oportunidades%rowtype;
  v_fecha timestamptz := coalesce(p_fecha, now());
  v_mot   text := nullif(trim(coalesce(p_motivo, '')), '');
begin
  perform set_config('app.actor', 'Agente cotizador', true);
  if p_tipo not in ('nota', 'llamada', 'whatsapp', 'reunion', 'email') then
    raise exception 'p_tipo inválido (usa nota, llamada, whatsapp, reunion o email)';
  end if;
  if nullif(trim(coalesce(p_detalle, '')), '') is null then raise exception 'p_detalle es obligatorio'; end if;
  if p_etapa is not null and p_etapa not in ('nuevo', 'contactado', 'diagnostico', 'propuesta', 'ganado', 'perdido') then
    raise exception 'p_etapa inválida (nuevo, contactado, diagnostico, propuesta, ganado, perdido)';
  end if;

  select * into op from public.oportunidades where id = p_oportunidad and organizacion_id = v_org;
  if not found then raise exception 'Oportunidad no encontrada'; end if;

  insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre, created_at)
  values (v_org, op.cliente_id, op.id, p_tipo, left(trim(p_detalle), 5000), 'Agente cotizador', v_fecha);

  if p_etapa is not null and p_etapa <> op.etapa then
    update public.oportunidades
       set etapa = p_etapa,
           motivo_perdida = case when p_etapa = 'perdido' then v_mot else null end
     where id = op.id;
    insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre, created_at)
    values (v_org, op.cliente_id, op.id, 'etapa',
            private.etapa_label(op.etapa) || ' → ' || private.etapa_label(p_etapa)
              || case when p_etapa = 'perdido' and v_mot is not null then ' · Motivo: ' || v_mot else '' end,
            'Agente cotizador', v_fecha);
  end if;

  return jsonb_build_object('ok', true, 'oportunidad_id', op.id, 'etapa', coalesce(p_etapa, op.etapa));
end;
$$;

create or replace function agente.registrar_cotizacion(
  p_oportunidad   uuid,
  p_plan          text,
  p_neto          numeric,
  p_semaforo      text default null,
  p_resumen       text default null,
  p_mensual       numeric default 0,
  p_estado        text default 'borrador',
  p_vigencia_dias int default 15,
  p_documento_url text default null,
  p_numero        text default null,
  p_fecha         date default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org   uuid := agente._org();
  op      public.oportunidades%rowtype;
  q       public.cotizaciones%rowtype;
  v_fecha date := coalesce(p_fecha, current_date);
begin
  perform set_config('app.actor', 'Agente cotizador', true);
  if p_estado not in ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida') then
    raise exception 'p_estado inválido (borrador, enviada, aceptada, rechazada, vencida)';
  end if;
  if p_semaforo is not null and p_semaforo not in ('verde', 'amarillo', 'rojo') then
    raise exception 'p_semaforo inválido (verde, amarillo, rojo)';
  end if;
  if p_neto is null or p_neto < 0 then raise exception 'p_neto debe ser un monto neto en pesos (>= 0)'; end if;

  select * into op from public.oportunidades where id = p_oportunidad and organizacion_id = v_org;
  if not found then raise exception 'Oportunidad no encontrada'; end if;

  insert into public.cotizaciones (organizacion_id, cliente_id, oportunidad_id, numero, fecha, vigencia_hasta, plan, semaforo, neto, mensual, estado, resumen, documento_url)
  values (v_org, op.cliente_id, op.id, coalesce(trim(p_numero), ''), v_fecha, v_fecha + greatest(coalesce(p_vigencia_dias, 15), 1),
          nullif(trim(coalesce(p_plan, '')), ''), p_semaforo, round(p_neto), round(coalesce(p_mensual, 0)), p_estado,
          nullif(trim(coalesce(p_resumen, '')), ''), nullif(trim(coalesce(p_documento_url, '')), ''))
  returning * into q;

  insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
  values (v_org, op.cliente_id, op.id, 'sistema',
          'Cotización ' || q.numero || ' (' || q.estado || '): ' || coalesce(q.plan, 'sin plan') || ', neto $' || replace(to_char(q.neto, 'FM999,999,999'), ',', '.') || ' + IVA'
            || case when q.mensual > 0 then ' · mensual $' || replace(to_char(q.mensual, 'FM999,999,999'), ',', '.') || ' + IVA' else '' end
            || ' · vigente hasta ' || to_char(q.vigencia_hasta, 'DD-MM-YYYY'),
          'Agente cotizador');

  return jsonb_build_object(
    'numero', q.numero, 'estado', q.estado, 'plan', q.plan, 'neto', q.neto, 'iva', round(q.neto * 0.19), 'total', round(q.neto * 1.19),
    'mensual', q.mensual, 'vigencia_hasta', q.vigencia_hasta,
    'oportunidad_id', op.id,
    'etapa_oportunidad', (select o.etapa from public.oportunidades o where o.id = op.id));
end;
$$;

create or replace function agente.actualizar_cotizacion(
  p_numero text,
  p_estado text default null,
  p_neto   numeric default null,
  p_nota   text default null
) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org uuid := agente._org();
  q     public.cotizaciones%rowtype;
  v_ant text;
begin
  perform set_config('app.actor', 'Agente cotizador', true);
  if p_estado is not null and p_estado not in ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida') then
    raise exception 'p_estado inválido (borrador, enviada, aceptada, rechazada, vencida)';
  end if;
  if p_neto is not null and p_neto < 0 then raise exception 'p_neto debe ser >= 0'; end if;

  select * into q from public.cotizaciones where numero = trim(p_numero) and organizacion_id = v_org;
  if not found then raise exception 'Cotización % no encontrada', p_numero; end if;
  v_ant := q.estado;

  update public.cotizaciones
     set estado = coalesce(p_estado, estado),
         neto   = coalesce(round(p_neto), neto)
   where id = q.id
   returning * into q;

  if p_estado is not null and p_estado <> v_ant then
    insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
    values (v_org, q.cliente_id, q.oportunidad_id, 'sistema', 'Cotización ' || q.numero || ': ' || v_ant || ' → ' || q.estado, 'Agente cotizador');
  end if;
  if nullif(trim(coalesce(p_nota, '')), '') is not null then
    insert into public.actividades (organizacion_id, cliente_id, oportunidad_id, tipo, detalle, usuario_nombre)
    values (v_org, q.cliente_id, q.oportunidad_id, 'nota', 'Cotización ' || q.numero || ': ' || left(trim(p_nota), 4800), 'Agente cotizador');
  end if;

  return jsonb_build_object('numero', q.numero, 'estado', q.estado, 'neto', q.neto, 'vigencia_hasta', q.vigencia_hasta,
                            'etapa_oportunidad', (select o.etapa from public.oportunidades o where o.id = q.oportunidad_id));
end;
$$;

create or replace function agente.crear_tarea(p_oportunidad uuid, p_titulo text, p_fecha date default null) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org uuid := agente._org();
  op    public.oportunidades%rowtype;
  t     public.tareas%rowtype;
begin
  perform set_config('app.actor', 'Agente cotizador', true);
  if nullif(trim(coalesce(p_titulo, '')), '') is null then raise exception 'p_titulo es obligatorio'; end if;
  select * into op from public.oportunidades where id = p_oportunidad and organizacion_id = v_org;
  if not found then raise exception 'Oportunidad no encontrada'; end if;
  insert into public.tareas (organizacion_id, cliente_id, oportunidad_id, titulo, fecha_limite)
  values (v_org, op.cliente_id, op.id, left(trim(p_titulo), 300), p_fecha)
  returning * into t;
  return jsonb_build_object('tarea_id', t.id, 'titulo', t.titulo, 'fecha_limite', t.fecha_limite);
end;
$$;

create or replace function agente.completar_tarea(p_tarea uuid) returns jsonb
language plpgsql set search_path = '' as $$
declare
  v_org uuid := agente._org();
  t     public.tareas%rowtype;
begin
  update public.tareas set estado = 'hecha', completada_at = now()
   where id = p_tarea and organizacion_id = v_org
   returning * into t;
  if not found then raise exception 'Tarea no encontrada'; end if;
  return jsonb_build_object('tarea_id', t.id, 'titulo', t.titulo, 'estado', t.estado);
end;
$$;

-- Nadie fuera de quien tenga acceso directo a SQL puede usar el esquema del agente.
revoke all on schema agente from public, anon, authenticated;
revoke all on all functions in schema agente from public, anon, authenticated;
