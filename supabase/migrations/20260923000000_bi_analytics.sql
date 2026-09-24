-- =====================================================================
-- Módulo BI & Estudio de Tiempos — DMAIX
-- =====================================================================
-- Hoy la app persiste todo en localStorage (ver src/contexts/BiContext.tsx,
-- que es el espejo local de estas tablas). Esta migración deja listo el
-- esquema para cuando el proyecto se conecte a Supabase.
--
-- SUPUESTOS sobre tablas que aún no existen en este repo (ajustar nombres al
-- esquema real antes de aplicar):
--   usuarios(id uuid PK, rol text)                        -- rol 'ADMIN' = Administración
--   paradas(id, estacion text, inicio timestamptz, duracion_minutos numeric)
--   ot_estaciones(ot_id, estacion text, ingreso timestamptz, salida timestamptz NULL)
--     -> una fila por cada paso de una OT por una estación (salida NULL = sigue ahí)
-- Requiere la extensión pg_cron (Dashboard → Database → Extensions).
-- =====================================================================

-- ---------------------------------------------------------------------
-- A. Capacidad instalada por estación
-- ---------------------------------------------------------------------
create table if not exists public.capacidad_estaciones (
  id uuid primary key default gen_random_uuid(),
  estacion text not null unique,
  horas_disponibles_semanales numeric not null default 40 check (horas_disponibles_semanales between 0 and 168),
  dotacion_operadores int not null default 2 check (dotacion_operadores >= 0)
);

insert into public.capacidad_estaciones (estacion) values
  ('ORDEN_COMPRA'), ('COMPRA_INSUMOS'), ('CORTE'), ('ARMADO_SOLDADURA'),
  ('PINTURA'), ('CONTROL_CALIDAD'), ('DESPACHO')
on conflict (estacion) do nothing;

-- ---------------------------------------------------------------------
-- B. Historial de reportes BI archivados
-- ---------------------------------------------------------------------
create table if not exists public.reportes_historicos_bi (
  id uuid primary key default gen_random_uuid(),
  tipo_reporte text not null check (tipo_reporte in ('Diario', 'Semanal', 'Mensual', 'A Pedido', 'Cierre de Mes')),
  fecha_inicio date not null,
  fecha_fin date not null check (fecha_fin >= fecha_inicio),
  kpis_snapshot jsonb not null,
  resumen_ia text,
  recomendaciones_dotacion text,
  -- Versión estructurada de las 4 secciones del informe, para re-renderizar el detalle.
  analisis_estructurado jsonb,
  -- NULL = generado por el cierre automático de mes.
  creado_por uuid references public.usuarios(id),
  "timestamp" timestamptz not null default now()
);

create index if not exists reportes_historicos_bi_periodo_idx
  on public.reportes_historicos_bi (fecha_inicio desc, tipo_reporte);

-- Un solo "Cierre de Mes" por mes.
create unique index if not exists reportes_historicos_bi_cierre_unico
  on public.reportes_historicos_bi (fecha_inicio) where tipo_reporte = 'Cierre de Mes';

-- Solo Administración lee/escribe estas tablas.
alter table public.capacidad_estaciones enable row level security;
alter table public.reportes_historicos_bi enable row level security;

create policy "admin_capacidad" on public.capacidad_estaciones for all
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'ADMIN'))
  with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'ADMIN'));

create policy "admin_reportes_bi" on public.reportes_historicos_bi for all
  using (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'ADMIN'))
  with check (exists (select 1 from public.usuarios u where u.id = auth.uid() and u.rol = 'ADMIN'));

-- ---------------------------------------------------------------------
-- C. Estudio de tiempos para una ventana arbitraria
-- ---------------------------------------------------------------------
-- Todas las horas se expresan en "horas de turno": el tiempo calendario (24/7)
-- se escala por horas_semanales / 168, así una ventana de 4 semanas da
-- Disponibles = horas_semanales × 4, y las horas trabajadas/en parada son
-- comparables con esa capacidad.
--   Horas Ociosas = Disponibles − (Trabajadas + En parada), con piso 0.
create or replace function public.bi_estudio_tiempos(p_desde timestamptz, p_hasta timestamptz)
returns table (
  estacion text,
  dotacion_operadores int,
  horas_disponibles numeric,
  horas_trabajadas numeric,
  horas_parada numeric,
  horas_ociosas numeric,
  utilizacion_pct numeric
)
language sql stable as $$
  with ventana as (
    select p_desde as desde, least(p_hasta, now()) as hasta
  ),
  trabajo as (
    select oe.estacion,
           sum(extract(epoch from (least(coalesce(oe.salida, now()), v.hasta) - greatest(oe.ingreso, v.desde))) / 3600) as horas
    from public.ot_estaciones oe, ventana v
    where oe.ingreso < v.hasta and coalesce(oe.salida, now()) > v.desde
    group by oe.estacion
  ),
  detenido as (
    select p.estacion, sum(p.duracion_minutos) / 60.0 as horas
    from public.paradas p, ventana v
    where p.inicio >= v.desde and p.inicio < v.hasta
    group by p.estacion
  ),
  base as (
    select c.estacion,
           c.dotacion_operadores,
           c.horas_disponibles_semanales / 168.0 as factor_turno,
           extract(epoch from (v.hasta - v.desde)) / 3600 as horas_ventana,
           coalesce(t.horas, 0) as horas_ot_calendario,
           coalesce(d.horas, 0) as horas_parada_calendario
    from public.capacidad_estaciones c
    cross join ventana v
    left join trabajo t on t.estacion = c.estacion
    left join detenido d on d.estacion = c.estacion
  )
  select estacion,
         dotacion_operadores,
         round(horas_ventana * factor_turno, 1) as horas_disponibles,
         -- El tiempo detenido ocurre mientras la OT está en la estación: se descuenta del trabajo.
         round(greatest(horas_ot_calendario - horas_parada_calendario, 0) * factor_turno, 1) as horas_trabajadas,
         round(horas_parada_calendario * factor_turno, 1) as horas_parada,
         round(greatest(horas_ventana - greatest(horas_ot_calendario - horas_parada_calendario, 0) - horas_parada_calendario, 0) * factor_turno, 1) as horas_ociosas,
         case when horas_ventana > 0
              then round(100 * least(greatest(horas_ot_calendario - horas_parada_calendario, 0) / horas_ventana, 1), 1)
              else 0 end as utilizacion_pct
  from base
  order by estacion;
$$;

-- Vista activa del dashboard: SIEMPRE el mes calendario en curso (día 1 → ahora).
-- No arrastra meses anteriores; el día 1 "se reinicia" sola, sin borrar nada.
create or replace view public.v_bi_estudio_tiempos_mes as
  select * from public.bi_estudio_tiempos(date_trunc('month', now()), now());

-- ---------------------------------------------------------------------
-- D. Cierre automático de mes
-- ---------------------------------------------------------------------
-- Archiva el snapshot numérico del mes que termina. Las columnas de IA
-- (resumen_ia, recomendaciones_dotacion, analisis_estructurado) quedan NULL:
-- PENDIENTE — completarlas del lado servidor requiere un paso extra (ej. una
-- Edge Function que tome los cierres con resumen_ia NULL y llame a la IA).
-- Mientras la app siga en localStorage, el cierre con IA lo hace BiContext.tsx.
create or replace function public.bi_cierre_mensual()
returns void
language plpgsql security definer as $$
declare
  v_desde timestamptz := date_trunc('month', now());
  v_hasta timestamptz := date_trunc('month', now()) + interval '1 month';
begin
  -- pg_cron corre los días 28-31: solo actúa si mañana es día 1.
  if extract(day from (now() + interval '1 day')) <> 1 then
    return;
  end if;

  insert into public.reportes_historicos_bi (tipo_reporte, fecha_inicio, fecha_fin, kpis_snapshot, creado_por)
  select 'Cierre de Mes',
         v_desde::date,
         (v_hasta - interval '1 day')::date,
         jsonb_build_object(
           'desde', v_desde,
           'hasta', v_hasta,
           'total_horas_disponibles', sum(e.horas_disponibles),
           'total_horas_trabajadas', sum(e.horas_trabajadas),
           'total_horas_parada', sum(e.horas_parada),
           'total_horas_ociosas', sum(e.horas_ociosas),
           'estaciones', jsonb_agg(to_jsonb(e) order by e.estacion)
         ),
         null
  from public.bi_estudio_tiempos(v_desde, v_hasta) e
  on conflict do nothing;
end;
$$;

-- Todos los días 28-31 a las 23:55 (hora del servidor, UTC en Supabase).
select cron.schedule('bi-cierre-mensual', '55 23 28-31 * *', $$select public.bi_cierre_mensual();$$);
