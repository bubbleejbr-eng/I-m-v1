-- Phase 1 foundation: personalized checklist and the risk/escalation
-- engine. Rule *definitions* are versioned reference data owned by
-- admins; rule *applications* to a specific journey are client-owned
-- records.

create table public.checklist_rules (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.immigration_workflow_versions (id) on delete cascade,
  document_category_id uuid references public.document_categories (id),
  rule_key text not null,
  document_name text not null,
  plain_language_explanation text not null,
  requirement_level text not null check (requirement_level in ('generally_requested', 'conditional', 'recommended', 'professional_review_item')),
  condition_expression jsonb,
  source_reference text,
  effective_date date,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'legal_review', 'approved', 'published', 'retired')),
  legal_reviewer_id uuid references auth.users (id),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_version_id, rule_key)
);

create trigger checklist_rules_set_updated_at
  before update on public.checklist_rules
  for each row execute function public.set_updated_at();

alter table public.checklist_rules enable row level security;

create policy checklist_rules_select_published on public.checklist_rules
  for select
  using (approval_status = 'published' or public.is_platform_admin());

create policy checklist_rules_admin_write on public.checklist_rules
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  checklist_rule_id uuid not null references public.checklist_rules (id),
  related_household_member_id uuid references public.household_members (id),
  document_id uuid references public.documents (id),
  status text not null default 'outstanding' check (status in ('outstanding', 'uploaded', 'in_review', 'accepted', 'needs_replacement')),
  reviewer_comment text,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger checklist_items_set_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

create index checklist_items_journey_idx on public.checklist_items (journey_id);

alter table public.checklist_items enable row level security;

create policy checklist_items_owner_or_admin on public.checklist_items
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.risk_rules (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.immigration_workflow_versions (id) on delete cascade,
  rule_key text not null,
  flag_category text not null check (flag_category in ('informational', 'consistency', 'professional_review_recommended', 'urgent')),
  flag_label text not null,
  explanation_template text not null,
  condition_expression jsonb,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'legal_review', 'approved', 'published', 'retired')),
  legal_reviewer_id uuid references auth.users (id),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_version_id, rule_key)
);

create trigger risk_rules_set_updated_at
  before update on public.risk_rules
  for each row execute function public.set_updated_at();

alter table public.risk_rules enable row level security;

create policy risk_rules_select_published on public.risk_rules
  for select
  using (approval_status = 'published' or public.is_platform_admin());

create policy risk_rules_admin_write on public.risk_rules
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- risk_flags never states an eligibility conclusion (see
-- PRODUCT_GUARDRAILS.md) — only that a rule fired and why, plus its
-- resolution state.
create table public.risk_flags (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  risk_rule_id uuid not null references public.risk_rules (id),
  triggering_explanation text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'overridden')),
  resolved_by uuid references auth.users (id),
  resolved_at timestamptz,
  override_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger risk_flags_set_updated_at
  before update on public.risk_flags
  for each row execute function public.set_updated_at();

create index risk_flags_journey_idx on public.risk_flags (journey_id);

alter table public.risk_flags enable row level security;

create policy risk_flags_owner_or_admin on public.risk_flags
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());
