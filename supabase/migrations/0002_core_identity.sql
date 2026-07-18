-- Phase 1: Profiles and organizations.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  middle_name text,
  last_name text not null,
  email text not null,
  mobile_phone text,
  country_of_birth text,
  country_of_residence text,
  us_state text,
  preferred_language text not null default 'en',
  preferred_communication_method text,
  time_zone text,
  marketing_consent boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select
  using (id = auth.uid() or public.is_platform_admin());

create policy profiles_update_own on public.profiles
  for update
  using (id = auth.uid() or public.is_platform_admin())
  with check (id = auth.uid() or public.is_platform_admin());

create policy profiles_insert_own on public.profiles
  for insert
  with check (id = auth.uid());

-- Organizations represent future law firms, nonprofits, and employer
-- accounts. Membership determines what an org_admin may see.
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization_type text not null check (organization_type in ('law_firm', 'nonprofit', 'employer', 'university', 'community_org', 'internal')),
  is_active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

alter table public.organizations enable row level security;

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  member_role text not null default 'member' check (member_role in ('member', 'org_admin')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index organization_members_org_idx on public.organization_members (organization_id);
create index organization_members_user_idx on public.organization_members (user_id);

alter table public.organization_members enable row level security;

create or replace function public.is_member_of_organization(check_organization_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = check_organization_id and user_id = check_user_id
  );
$$;

create policy organizations_select_members on public.organizations
  for select
  using (public.is_member_of_organization(id) or public.is_platform_admin());

create policy organizations_admin_write on public.organizations
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create policy organization_members_select_self on public.organization_members
  for select
  using (user_id = auth.uid() or public.is_member_of_organization(organization_id) or public.is_platform_admin());

create policy organization_members_admin_write on public.organization_members
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
