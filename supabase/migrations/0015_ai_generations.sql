-- Phase 1 foundation: AI output records. Per product guardrails, only
-- concise system explanations and user-visible output are stored here
-- — never hidden chain-of-thought or reasoning content.

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_key text not null,
  version_label text not null,
  model_identifier text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (prompt_key, version_label)
);

alter table public.prompt_versions enable row level security;

create policy prompt_versions_admin_only on public.prompt_versions
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  prompt_version_id uuid references public.prompt_versions (id),
  related_answer_ids uuid[] not null default '{}',
  related_document_ids uuid[] not null default '{}',
  generated_output text not null,
  client_edits text,
  client_approved_at timestamptz,
  reviewer_edits text,
  reviewer_approval_status text check (reviewer_approval_status in ('pending', 'approved', 'changes_requested')),
  final_status text not null default 'draft' check (final_status in ('draft', 'client_approved', 'reviewer_approved', 'superseded')),
  created_at timestamptz not null default now()
);

create index ai_generations_journey_idx on public.ai_generations (journey_id);

alter table public.ai_generations enable row level security;

create policy ai_generations_owner_or_admin on public.ai_generations
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin() or public.is_assigned_to_journey(journey_id))
  with check (public.owns_journey(journey_id) or public.is_platform_admin());
