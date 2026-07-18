-- Phase 1 foundation: professional review workflow, professional
-- verification records, and the future G-28 representation-engagement
-- table. Per product guardrails, a review_request never implies
-- representation, and representation_engagements is never populated
-- automatically by a payment.

create table public.review_products (
  id uuid primary key default gen_random_uuid(),
  product_key text not null unique,
  product_name text not null,
  description text,
  sample_price_cents integer not null default 0,
  is_sample_pricing boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger review_products_set_updated_at
  before update on public.review_products
  for each row execute function public.set_updated_at();

alter table public.review_products enable row level security;

create policy review_products_select_active on public.review_products
  for select
  using (is_active or public.is_platform_admin());

create policy review_products_admin_write on public.review_products
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.review_requests (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  review_product_id uuid not null references public.review_products (id),
  status text not null default 'draft' check (status in (
    'draft', 'payment_pending', 'submitted', 'intake_review', 'awaiting_assignment',
    'assigned', 'under_review', 'clarification_requested', 'client_responded',
    'review_completed', 'consultation_scheduled', 'engagement_offered',
    'engagement_accepted', 'closed', 'declined', 'refunded'
  )),
  government_form_id uuid references public.government_forms (id),
  filing_deadline date,
  preferred_language text,
  current_jurisdiction text,
  description text,
  questions_for_reviewer text,
  shares_case_materials boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger review_requests_set_updated_at
  before update on public.review_requests
  for each row execute function public.set_updated_at();

create index review_requests_journey_idx on public.review_requests (journey_id);

alter table public.review_requests enable row level security;

create policy review_requests_owner_or_admin on public.review_requests
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  professional_type text not null check (professional_type in ('reviewer', 'attorney', 'nonprofit_case_manager')),
  bar_number text,
  licensing_jurisdiction text,
  professional_contact_email text,
  professional_contact_phone text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger professional_profiles_set_updated_at
  before update on public.professional_profiles
  for each row execute function public.set_updated_at();

alter table public.professional_profiles enable row level security;

create policy professional_profiles_select_own on public.professional_profiles
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy professional_profiles_admin_write on public.professional_profiles
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- professional_verifications is intentionally admin-write-only: no
-- professional can verify themselves as an attorney.
create table public.professional_verifications (
  id uuid primary key default gen_random_uuid(),
  professional_profile_id uuid not null references public.professional_profiles (id) on delete cascade,
  bar_status_confirmed boolean not null default false,
  conflict_check_acknowledged boolean not null default false,
  scope_of_engagement_accepted boolean not null default false,
  verified_by uuid references auth.users (id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.professional_verifications enable row level security;

create policy professional_verifications_select on public.professional_verifications
  for select
  using (
    public.is_platform_admin()
    or exists (
      select 1 from public.professional_profiles p
      where p.id = professional_profile_id and p.user_id = auth.uid()
    )
  );

create policy professional_verifications_admin_write on public.professional_verifications
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- review_assignments is the join that grants a reviewer/attorney access
-- to one specific matter. Nothing else grants that access — see the
-- reviewer-visibility policies added below.
create table public.review_assignments (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid not null references public.review_requests (id) on delete cascade,
  professional_profile_id uuid not null references public.professional_profiles (id),
  assigned_by uuid references auth.users (id),
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz
);

create index review_assignments_request_idx on public.review_assignments (review_request_id);
create index review_assignments_professional_idx on public.review_assignments (professional_profile_id);

alter table public.review_assignments enable row level security;

create or replace function public.is_assigned_to_journey(check_journey_id uuid, check_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.review_assignments ra
    join public.review_requests rr on rr.id = ra.review_request_id
    join public.professional_profiles pp on pp.id = ra.professional_profile_id
    where rr.journey_id = check_journey_id
      and pp.user_id = check_user_id
      and ra.unassigned_at is null
  );
$$;

create policy review_assignments_select on public.review_assignments
  for select
  using (
    public.is_platform_admin()
    or exists (
      select 1 from public.professional_profiles p
      where p.id = professional_profile_id and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.review_requests rr
      where rr.id = review_request_id and public.owns_journey(rr.journey_id)
    )
  );

create policy review_assignments_admin_write on public.review_assignments
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- reviewer_notes splits internal (reviewer/admin only) from
-- client-visible correction requests, per the required reviewer
-- permission boundary.
create table public.reviewer_notes (
  id uuid primary key default gen_random_uuid(),
  review_request_id uuid not null references public.review_requests (id) on delete cascade,
  author_id uuid not null references auth.users (id),
  note_text text not null,
  is_client_visible boolean not null default false,
  created_at timestamptz not null default now()
);

create index reviewer_notes_request_idx on public.reviewer_notes (review_request_id);

alter table public.reviewer_notes enable row level security;

create policy reviewer_notes_client_visible on public.reviewer_notes
  for select
  using (
    is_client_visible = true
    and exists (
      select 1 from public.review_requests rr
      where rr.id = review_request_id and public.owns_journey(rr.journey_id)
    )
  );

create policy reviewer_notes_professional_select on public.reviewer_notes
  for select
  using (
    public.is_platform_admin()
    or exists (
      select 1 from public.review_requests rr
      where rr.id = review_request_id and public.is_assigned_to_journey(rr.journey_id)
    )
  );

create policy reviewer_notes_professional_insert on public.reviewer_notes
  for insert
  with check (
    author_id = auth.uid()
    and (
      public.is_platform_admin()
      or exists (
        select 1 from public.review_requests rr
        where rr.id = review_request_id and public.is_assigned_to_journey(rr.journey_id)
      )
    )
  );

-- representation_engagements: the future G-28 workflow. Every
-- authorization step is a separate boolean/timestamp so "paid for a
-- review" can never, by itself, satisfy this table's requirements.
create table public.representation_engagements (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  professional_profile_id uuid references public.professional_profiles (id),
  scope_of_representation text,
  conflict_check_completed boolean not null default false,
  professional_accepted_at timestamptz,
  client_accepted_at timestamptz,
  engagement_agreement_storage_path text,
  g28_storage_path text,
  representation_status text not null default 'not_started' check (representation_status in (
    'not_started', 'offered', 'client_review', 'active', 'declined', 'ended'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger representation_engagements_set_updated_at
  before update on public.representation_engagements
  for each row execute function public.set_updated_at();

alter table public.representation_engagements enable row level security;

create policy representation_engagements_select on public.representation_engagements
  for select
  using (public.owns_journey(journey_id) or public.is_platform_admin() or public.is_assigned_to_journey(journey_id));

create policy representation_engagements_admin_write on public.representation_engagements
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- Now that review_assignments exists, extend reviewer visibility to the
-- journey and its dependent records. These are additive permissive
-- policies — combined with the owner/admin policies via OR — so an
-- assigned reviewer can see (but the earlier policies still control
-- write access for) exactly the matters they're assigned to.
create policy immigration_journeys_select_assigned on public.immigration_journeys
  for select
  using (public.is_assigned_to_journey(id));

create policy user_answers_select_assigned on public.user_answers
  for select
  using (public.is_assigned_to_journey(journey_id));

create policy documents_select_assigned on public.documents
  for select
  using (public.is_assigned_to_journey(journey_id));

create policy checklist_items_select_assigned on public.checklist_items
  for select
  using (public.is_assigned_to_journey(journey_id));

create policy risk_flags_select_assigned on public.risk_flags
  for select
  using (public.is_assigned_to_journey(journey_id));
