-- Phase 1 foundation: Help Center content and translation strings.
-- Every legal/immigration-content article requires an approval status
-- before publication — a legal conclusion may never ship "draft".

create table public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  slug text not null unique,
  title text not null,
  body_markdown text not null,
  author_id uuid references auth.users (id),
  legal_reviewer_id uuid references auth.users (id),
  review_status text not null default 'draft' check (review_status in ('draft', 'legal_review', 'approved', 'published', 'retired')),
  effective_date date,
  last_reviewed_at timestamptz,
  source_references text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger knowledge_articles_set_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();

alter table public.knowledge_articles enable row level security;

create policy knowledge_articles_select_published on public.knowledge_articles
  for select
  using (review_status = 'published' or public.is_platform_admin());

create policy knowledge_articles_admin_write on public.knowledge_articles
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

-- translations backs future admin-editable UI copy, complementing (and
-- eventually replacing) the static src/i18n/locales JSON files.
create table public.translations (
  id uuid primary key default gen_random_uuid(),
  translation_key text not null,
  language_code text not null,
  translated_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (translation_key, language_code)
);

create trigger translations_set_updated_at
  before update on public.translations
  for each row execute function public.set_updated_at();

alter table public.translations enable row level security;

create policy translations_select_all on public.translations
  for select
  using (true);

create policy translations_admin_write on public.translations
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
