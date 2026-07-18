-- Phase 1 foundation: affordable/nonprofit help pathway. Submitting a
-- request never guarantees representation or assistance — see the
-- notice text in src/content/brand.ts (legalNotices.affordableHelpNotice).

create table public.financial_assistance_requests (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  household_size integer,
  approximate_household_income numeric,
  us_state text,
  language text,
  urgency text check (urgency in ('routine', 'soon', 'urgent')),
  is_detained boolean not null default false,
  has_upcoming_deadline boolean not null default false,
  needs_disability_accommodation boolean not null default false,
  is_requesting_fee_waiver boolean not null default false,
  is_requesting_nonprofit_assistance boolean not null default false,
  can_afford_fixed_fee_review boolean,
  financial_hardship_explanation text,
  status text not null default 'submitted' check (status in ('submitted', 'reviewing', 'routed', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger financial_assistance_requests_set_updated_at
  before update on public.financial_assistance_requests
  for each row execute function public.set_updated_at();

create index financial_assistance_requests_journey_idx on public.financial_assistance_requests (journey_id);

alter table public.financial_assistance_requests enable row level security;

create policy financial_assistance_requests_owner_or_admin on public.financial_assistance_requests
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

-- organization_referrals tracks routing a request to a partner
-- organization (e.g. Anaya's Way Immigration Advocates), which is a
-- separate nonprofit service organization, not the software owner.
create table public.organization_referrals (
  id uuid primary key default gen_random_uuid(),
  financial_assistance_request_id uuid references public.financial_assistance_requests (id) on delete cascade,
  review_request_id uuid references public.review_requests (id) on delete cascade,
  organization_id uuid not null references public.organizations (id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_referrals_source_check check (
    financial_assistance_request_id is not null or review_request_id is not null
  )
);

create trigger organization_referrals_set_updated_at
  before update on public.organization_referrals
  for each row execute function public.set_updated_at();

alter table public.organization_referrals enable row level security;

create policy organization_referrals_select on public.organization_referrals
  for select
  using (
    public.is_platform_admin()
    or public.is_member_of_organization(organization_id)
    or exists (
      select 1 from public.financial_assistance_requests f
      where f.id = financial_assistance_request_id and public.owns_journey(f.journey_id)
    )
    or exists (
      select 1 from public.review_requests r
      where r.id = review_request_id and public.owns_journey(r.journey_id)
    )
  );

create policy organization_referrals_admin_write on public.organization_referrals
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
