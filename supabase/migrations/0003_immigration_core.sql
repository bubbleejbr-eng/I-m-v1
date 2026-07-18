-- Phase 1: Immigration journey catalog, active client journeys, and the
-- government-form/workflow-versioning foundation. Workflow content
-- itself (questions, evidence rules, risk rules) is data-driven and
-- lives in later migrations / the admin interface, never hardcoded in
-- the frontend.

create table public.immigration_journey_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  situation_label text not null,
  description text not null,
  agency text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger immigration_journey_types_set_updated_at
  before update on public.immigration_journey_types
  for each row execute function public.set_updated_at();

alter table public.immigration_journey_types enable row level security;

-- The catalog of journeys is public reference content: any authenticated
-- user needs to read it to choose a journey during onboarding.
create policy immigration_journey_types_select_all on public.immigration_journey_types
  for select
  using (true);

create policy immigration_journey_types_admin_write on public.immigration_journey_types
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.government_forms (
  id uuid primary key default gen_random_uuid(),
  form_number text not null unique,
  form_title text not null,
  agency text not null default 'USCIS',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger government_forms_set_updated_at
  before update on public.government_forms
  for each row execute function public.set_updated_at();

alter table public.government_forms enable row level security;

create policy government_forms_select_all on public.government_forms
  for select
  using (true);

create policy government_forms_admin_write on public.government_forms
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.form_editions (
  id uuid primary key default gen_random_uuid(),
  government_form_id uuid not null references public.government_forms (id) on delete cascade,
  edition_date date not null,
  source_url text,
  created_at timestamptz not null default now()
);

alter table public.form_editions enable row level security;

create policy form_editions_select_all on public.form_editions
  for select
  using (true);

create policy form_editions_admin_write on public.form_editions
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- A workflow version is the versioned, approved ruleset behind a
-- journey type (questions, evidence, escalation rules as of a point in
-- time). Never mutate a published version in place — publish a new one
-- and retire the old one, so an in-progress client matter keeps the
-- rules it started with.
create table public.immigration_workflow_versions (
  id uuid primary key default gen_random_uuid(),
  journey_type_id uuid not null references public.immigration_journey_types (id) on delete cascade,
  government_form_id uuid references public.government_forms (id),
  version_label text not null,
  jurisdiction text,
  form_edition_date date,
  effective_date date,
  retirement_date date,
  status text not null default 'draft' check (status in ('draft', 'legal_review', 'approved', 'published', 'retired')),
  author_id uuid references auth.users (id),
  legal_reviewer_id uuid references auth.users (id),
  approved_at timestamptz,
  government_source_references text,
  internal_guidance_references text,
  change_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_type_id, version_label)
);

create trigger immigration_workflow_versions_set_updated_at
  before update on public.immigration_workflow_versions
  for each row execute function public.set_updated_at();

create index immigration_workflow_versions_journey_type_idx on public.immigration_workflow_versions (journey_type_id);

alter table public.immigration_workflow_versions enable row level security;

create policy immigration_workflow_versions_select_published on public.immigration_workflow_versions
  for select
  using (status = 'published' or public.is_platform_admin());

create policy immigration_workflow_versions_admin_write on public.immigration_workflow_versions
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- immigration_journeys is a client's individual, in-progress matter. It
-- pins the workflow_version_id at creation time so later rule changes
-- never silently change an active user's in-flight requirements.
create table public.immigration_journeys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users (id) on delete cascade,
  journey_type_id uuid not null references public.immigration_journey_types (id),
  workflow_version_id uuid references public.immigration_workflow_versions (id),
  organization_id uuid references public.organizations (id),
  status text not null default 'in_progress' check (status in ('in_progress', 'ready_for_review', 'in_review', 'completed', 'withdrawn')),
  preparation_percent integer not null default 0 check (preparation_percent between 0 and 100),
  is_urgent boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger immigration_journeys_set_updated_at
  before update on public.immigration_journeys
  for each row execute function public.set_updated_at();

create index immigration_journeys_client_idx on public.immigration_journeys (client_id);
create index immigration_journeys_type_idx on public.immigration_journeys (journey_type_id);

alter table public.immigration_journeys enable row level security;

-- Ownership check reused by every downstream table that hangs off a
-- journey (answers, documents, checklist items, risk flags, tasks...).
-- Centralizing it here means a single fix covers every dependent table.
create or replace function public.owns_journey(check_journey_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.immigration_journeys
    where id = check_journey_id and client_id = check_user_id
  );
$$;

create policy immigration_journeys_select_own on public.immigration_journeys
  for select
  using (client_id = auth.uid() or public.is_platform_admin());

create policy immigration_journeys_insert_own on public.immigration_journeys
  for insert
  with check (client_id = auth.uid());

create policy immigration_journeys_update_own on public.immigration_journeys
  for update
  using (client_id = auth.uid() or public.is_platform_admin())
  with check (client_id = auth.uid() or public.is_platform_admin());
