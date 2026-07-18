-- Phase 1: Extensions and shared helper functions.
-- These helpers centralize the RLS logic reused by every later migration
-- so access rules are expressed consistently instead of re-derived per
-- table, and so a permission bug gets fixed in one place.

create extension if not exists "pgcrypto";

-- Generic updated_at trigger, attached to every table with an
-- updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- The application-wide role vocabulary. Kept in sync with
-- src/types/roles.ts.
create type public.app_role as enum (
  'client',
  'reviewer',
  'attorney',
  'nonprofit_case_manager',
  'org_admin',
  'platform_admin'
);

-- user_roles is created here (ahead of profiles) because the helper
-- functions below depend on it, and every subsequent RLS policy in this
-- migration set depends on these helpers.
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  organization_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  unique (user_id, role, organization_id)
);

create index user_roles_user_id_idx on public.user_roles (user_id);

alter table public.user_roles enable row level security;

-- security definer functions bypass RLS internally (safe: they only ever
-- read user_roles to answer a yes/no question), which is what lets them
-- be used inside other tables' RLS policies without infinite recursion.
create or replace function public.has_role(check_user_id uuid, check_role public.app_role)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = check_user_id and role = check_role
  );
$$;

create or replace function public.is_platform_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_role(check_user_id, 'platform_admin');
$$;

create or replace function public.current_user_roles()
returns setof public.app_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

-- Clients can read only their own role memberships. No one — including
-- the client themselves — can insert, update, or delete their own row
-- through the client API; role grants happen only through a
-- controlled, server-side elevated process (future admin edge function).
create policy user_roles_select_own on public.user_roles
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy user_roles_admin_write on public.user_roles
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
