-- Phase 1 foundation: document categories (reference data) and the
-- secure document vault. Actual files live in a private Supabase
-- Storage bucket, never a public one, and are only ever served through
-- signed, expiring URLs generated server-side.

create table public.document_categories (
  id uuid primary key default gen_random_uuid(),
  journey_type_id uuid references public.immigration_journey_types (id) on delete cascade,
  category_key text not null,
  category_label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (journey_type_id, category_key)
);

alter table public.document_categories enable row level security;

create policy document_categories_select_all on public.document_categories
  for select
  using (true);

create policy document_categories_admin_write on public.document_categories
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  category_id uuid references public.document_categories (id),
  ai_suggested_category_id uuid references public.document_categories (id),
  related_household_member_id uuid references public.household_members (id),
  related_questionnaire_section_id uuid references public.questionnaire_sections (id),
  storage_bucket text not null default 'immigration-documents',
  storage_path text not null,
  original_filename text not null,
  display_name text not null,
  mime_type text not null,
  file_size_bytes bigint,
  document_date date,
  expiration_date date,
  review_status text not null default 'not_reviewed' check (review_status in ('not_reviewed', 'in_review', 'accepted', 'needs_replacement')),
  virus_scan_status text not null default 'pending' check (virus_scan_status in ('pending', 'clean', 'flagged')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id)
);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create index documents_journey_idx on public.documents (journey_id);
create index documents_category_idx on public.documents (category_id);

alter table public.documents enable row level security;

create policy documents_owner_or_admin on public.documents
  for all
  using (public.owns_journey(journey_id) or public.is_platform_admin())
  with check (public.owns_journey(journey_id) or public.is_platform_admin());

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents (id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  file_size_bytes bigint,
  uploaded_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index document_versions_document_idx on public.document_versions (document_id);

alter table public.document_versions enable row level security;

create policy document_versions_owner_or_admin on public.document_versions
  for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and (public.owns_journey(d.journey_id) or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and (public.owns_journey(d.journey_id) or public.is_platform_admin())
    )
  );

-- Private storage bucket. `public` is intentionally false: every file
-- access must go through a signed URL, never a guessable public path.
insert into storage.buckets (id, name, public)
values ('immigration-documents', 'immigration-documents', false)
on conflict (id) do nothing;

create policy storage_documents_owner_select on storage.objects
  for select
  using (
    bucket_id = 'immigration-documents'
    and exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name
        and (public.owns_journey(d.journey_id) or public.is_platform_admin())
    )
  );

create policy storage_documents_owner_insert on storage.objects
  for insert
  with check (
    bucket_id = 'immigration-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy storage_documents_owner_delete on storage.objects
  for delete
  using (
    bucket_id = 'immigration-documents'
    and exists (
      select 1 from public.documents d
      where d.storage_path = storage.objects.name
        and (public.owns_journey(d.journey_id) or public.is_platform_admin())
    )
  );
