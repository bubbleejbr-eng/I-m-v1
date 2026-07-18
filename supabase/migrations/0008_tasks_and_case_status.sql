-- Phase 1 foundation: client tasks, deadlines, and manually-entered
-- USCIS case status. No government API is called or scraped; this is a
-- manual-entry tracking tool only.

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'completed', 'dismissed')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index tasks_journey_idx on public.tasks (journey_id);

alter table public.tasks enable row level security;

create policy tasks_owner_or_admin on public.tasks
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  title text not null,
  deadline_date date not null,
  deadline_type text check (deadline_type in ('rfe_response', 'noid_response', 'court_hearing', 'filing_window', 'other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger deadlines_set_updated_at
  before update on public.deadlines
  for each row execute function public.set_updated_at();

create index deadlines_journey_idx on public.deadlines (journey_id);

alter table public.deadlines enable row level security;

create policy deadlines_owner_or_admin on public.deadlines
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.receipt_numbers (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  receipt_number text not null check (receipt_number ~ '^[A-Z]{3}[0-9]{10}$'),
  government_form_id uuid references public.government_forms (id),
  created_at timestamptz not null default now()
);

create index receipt_numbers_journey_idx on public.receipt_numbers (journey_id);

alter table public.receipt_numbers enable row level security;

create policy receipt_numbers_owner_or_admin on public.receipt_numbers
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.case_status_records (
  id uuid primary key default gen_random_uuid(),
  receipt_number_id uuid not null references public.receipt_numbers (id) on delete cascade,
  current_status text not null,
  client_notes text,
  last_checked_at timestamptz,
  official_status_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger case_status_records_set_updated_at
  before update on public.case_status_records
  for each row execute function public.set_updated_at();

alter table public.case_status_records enable row level security;

create policy case_status_records_owner_or_admin on public.case_status_records
  for all
  using (
    exists (
      select 1 from public.receipt_numbers r
      where r.id = receipt_number_id and (public.owns_journey(r.journey_id) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from public.receipt_numbers r
      where r.id = receipt_number_id and (public.owns_journey(r.journey_id) or public.is_platform_admin())
    )
  );

create table public.case_status_history (
  id uuid primary key default gen_random_uuid(),
  case_status_record_id uuid not null references public.case_status_records (id) on delete cascade,
  status text not null,
  recorded_at timestamptz not null default now()
);

alter table public.case_status_history enable row level security;

create policy case_status_history_owner_or_admin on public.case_status_history
  for all
  using (
    exists (
      select 1 from public.case_status_records c
      join public.receipt_numbers r on r.id = c.receipt_number_id
      where c.id = case_status_record_id and (public.owns_journey(r.journey_id) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from public.case_status_records c
      join public.receipt_numbers r on r.id = c.receipt_number_id
      where c.id = case_status_record_id and (public.owns_journey(r.journey_id) or public.is_platform_admin())
    )
  );
