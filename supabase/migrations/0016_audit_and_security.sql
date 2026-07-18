-- Phase 1 foundation: audit logging and security events. Audit logs are
-- append-only from the client's perspective — no update or delete
-- policy exists for standard users at all, and even inserts are
-- expected to normally flow through security-definer functions or
-- server-side (service role) code rather than direct client writes.
-- Descriptions must never contain full document contents, SSNs,
-- passport numbers, or full sensitive answers (enforced by convention
-- and application-layer redaction, not by the database).

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id),
  actor_role public.app_role,
  event_type text not null,
  journey_id uuid references public.immigration_journeys (id),
  target_table text,
  target_id uuid,
  description text,
  created_at timestamptz not null default now()
);

create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_journey_idx on public.audit_logs (journey_id);
create index audit_logs_event_type_idx on public.audit_logs (event_type);

alter table public.audit_logs enable row level security;

create policy audit_logs_select on public.audit_logs
  for select
  using (actor_id = auth.uid() or public.is_platform_admin());

create policy audit_logs_insert on public.audit_logs
  for insert
  with check (actor_id = auth.uid() or public.is_platform_admin());

-- No update or delete policy is defined for audit_logs: the table is
-- append-only for every role, including platform_admin.

create or replace function public.log_audit_event(
  p_event_type text,
  p_journey_id uuid default null,
  p_target_table text default null,
  p_target_id uuid default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  caller_role public.app_role;
begin
  select role into caller_role from public.user_roles where user_id = auth.uid() limit 1;

  insert into public.audit_logs (actor_id, actor_role, event_type, journey_id, target_table, target_id, description)
  values (auth.uid(), caller_role, p_event_type, p_journey_id, p_target_table, p_target_id, p_description)
  returning id into new_id;

  return new_id;
end;
$$;

create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  event_type text not null check (event_type in (
    'sign_in', 'failed_sign_in', 'password_change', 'security_setting_change',
    'session_revoked', 'suspicious_activity'
  )),
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index security_events_user_idx on public.security_events (user_id);

alter table public.security_events enable row level security;

create policy security_events_select_own on public.security_events
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy security_events_insert on public.security_events
  for insert
  with check (user_id = auth.uid() or public.is_platform_admin());
