-- Phase 1: consent records. Every onboarding checkbox (Terms of Use,
-- Privacy Policy, electronic communication, government non-affiliation
-- understanding, no-automatic-attorney-client-relationship
-- understanding, truthful-information confirmation, AI-processing
-- consent, document-processing consent, optional marketing consent) is
-- its own row so withdrawal and audit history are unambiguous. Consent
-- boxes must never be pre-checked in the UI.

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms_of_use', 'privacy_policy', 'electronic_communication',
    'government_non_affiliation_understanding', 'no_attorney_client_relationship_understanding',
    'truthful_information_confirmation', 'ai_processing_consent', 'document_processing_consent',
    'marketing_consent', 'professional_sharing_consent'
  )),
  accepted boolean not null,
  accepted_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now()
);

create index consents_user_idx on public.consents (user_id);

alter table public.consents enable row level security;

create policy consents_select_own on public.consents
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy consents_insert_own on public.consents
  for insert
  with check (user_id = auth.uid());

create policy consents_update_own on public.consents
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
