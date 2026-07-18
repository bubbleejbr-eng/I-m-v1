-- Phase 1 foundation: questionnaire structure. Question text,
-- conditional logic, and answers are strictly data, never hardcoded in
-- React components, so the admin workflow editor (Phase 4) can change
-- them without a deploy.

create table public.questionnaire_sections (
  id uuid primary key default gen_random_uuid(),
  workflow_version_id uuid not null references public.immigration_workflow_versions (id) on delete cascade,
  section_key text not null,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workflow_version_id, section_key)
);

create trigger questionnaire_sections_set_updated_at
  before update on public.questionnaire_sections
  for each row execute function public.set_updated_at();

alter table public.questionnaire_sections enable row level security;

create policy questionnaire_sections_select_all on public.questionnaire_sections
  for select
  using (true);

create policy questionnaire_sections_admin_write on public.questionnaire_sections
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.questionnaire_sections (id) on delete cascade,
  question_key text not null,
  prompt_text text not null,
  plain_language_explanation text,
  input_type text not null check (input_type in ('text', 'textarea', 'date', 'select', 'multiselect', 'boolean', 'file', 'not_sure')),
  allow_not_sure boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, question_key)
);

create trigger questions_set_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

alter table public.questions enable row level security;

create policy questions_select_all on public.questions
  for select
  using (true);

create policy questions_admin_write on public.questions
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  option_value text not null,
  option_label text not null,
  sort_order integer not null default 0
);

alter table public.question_options enable row level security;

create policy question_options_select_all on public.question_options
  for select
  using (true);

create policy question_options_admin_write on public.question_options
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.conditional_rules (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  depends_on_question_id uuid not null references public.questions (id) on delete cascade,
  condition_operator text not null check (condition_operator in ('equals', 'not_equals', 'includes', 'is_answered')),
  condition_value text,
  created_at timestamptz not null default now()
);

alter table public.conditional_rules enable row level security;

create policy conditional_rules_select_all on public.conditional_rules
  for select
  using (true);

create policy conditional_rules_admin_write on public.conditional_rules
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- user_answers holds the current answer per question per journey.
-- raw_user_text preserves exactly what the client typed; normalized_value
-- stores the cleaned/structured version, kept separate per product
-- requirement so the user's original wording is never silently lost.
create table public.user_answers (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  question_id uuid not null references public.questions (id),
  raw_user_text text,
  normalized_value jsonb,
  is_not_sure boolean not null default false,
  source text not null default 'user_entered' check (source in ('user_entered', 'ai_extracted_unconfirmed', 'ai_extracted_confirmed')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (journey_id, question_id)
);

create trigger user_answers_set_updated_at
  before update on public.user_answers
  for each row execute function public.set_updated_at();

create index user_answers_journey_idx on public.user_answers (journey_id);

alter table public.user_answers enable row level security;

create policy user_answers_select_own on public.user_answers
  for select
  using (public.owns_journey(journey_id) or public.is_platform_admin());

create policy user_answers_write_own on public.user_answers
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

-- answer_versions preserves history any time an answer changes, so a
-- reviewer or auditor can see what changed and when.
create table public.answer_versions (
  id uuid primary key default gen_random_uuid(),
  user_answer_id uuid not null references public.user_answers (id) on delete cascade,
  raw_user_text text,
  normalized_value jsonb,
  changed_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index answer_versions_answer_idx on public.answer_versions (user_answer_id);

alter table public.answer_versions enable row level security;

create policy answer_versions_select_own on public.answer_versions
  for select
  using (
    exists (
      select 1 from public.user_answers ua
      where ua.id = user_answer_id and (public.owns_journey(ua.journey_id) or public.is_platform_admin())
    )
  );

create policy answer_versions_insert_own on public.answer_versions
  for insert
  with check (
    exists (
      select 1 from public.user_answers ua
      where ua.id = user_answer_id and (public.owns_journey(ua.journey_id) or public.is_platform_admin())
    )
  );
