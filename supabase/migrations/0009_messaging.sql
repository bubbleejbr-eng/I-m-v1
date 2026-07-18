-- Phase 1 foundation: in-app messages and notifications. Email, SMS,
-- and WhatsApp are future delivery channels layered on top of the same
-- notification record — see notification_templates in platform settings.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  sender_id uuid references auth.users (id),
  recipient_id uuid references auth.users (id),
  body text not null,
  is_internal_note boolean not null default false,
  created_at timestamptz not null default now()
);

create index messages_journey_idx on public.messages (journey_id);

alter table public.messages enable row level security;

-- Internal notes are never visible to the client, only to reviewers and
-- admins, per the reviewer-note visibility split required by the
-- product spec.
create policy messages_client_visible on public.messages
  for select
  using (
    is_internal_note = false
    and (public.owns_journey(journey_id) or public.is_platform_admin())
  );

create policy messages_client_insert on public.messages
  for insert
  with check (public.owns_journey(journey_id) and is_internal_note = false and sender_id = auth.uid());

create policy messages_admin_all on public.messages
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  title text not null,
  body_preview text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

create policy notifications_select_own on public.notifications
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy notifications_update_own on public.notifications
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_admin_insert on public.notifications
  for insert
  with check (public.is_platform_admin());
