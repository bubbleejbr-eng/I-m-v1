-- Phase 1 foundation: structured case-history tables that back the
-- address/employment/travel/marriage timelines. All are journey-scoped
-- and share the same owner-or-admin RLS shape as user_answers.

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  relationship text not null,
  full_name text not null,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  household_member_id uuid references public.household_members (id),
  street_line1 text,
  street_line2 text,
  city text,
  state_province text,
  postal_code text,
  country text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.employments (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  employer_name text,
  occupation text,
  city text,
  state_province text,
  country text,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  school_name text,
  city text,
  state_province text,
  country text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  departure_date date,
  return_date date,
  destination_country text,
  reason_for_trip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marriages (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  spouse_full_name text,
  marriage_date date,
  marriage_location text,
  marriage_ended_date date,
  marriage_ended_reason text check (marriage_ended_reason in ('divorce', 'death', 'annulment')),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  full_name text,
  date_of_birth date,
  country_of_birth text,
  current_country_of_residence text,
  relationship_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.immigration_events (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  event_type text not null,
  event_date date,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.government_notices (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  notice_type text not null check (notice_type in ('rfe', 'noid', 'denial', 'nta', 'other')),
  received_date date,
  response_deadline date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Apply the identical owner-or-admin RLS shape to every table above.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'household_members', 'addresses', 'employments', 'schools', 'trips',
    'marriages', 'children', 'immigration_events', 'government_notices'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
    execute format(
      'create index %I_journey_idx on public.%I (journey_id)',
      table_name, table_name
    );
    execute format(
      'create policy %I_owner_or_admin on public.%I for all using (public.owns_journey(journey_id) or public.is_platform_admin()) with check (public.owns_journey(journey_id) or public.is_platform_admin())',
      table_name, table_name
    );
  end loop;
end $$;
