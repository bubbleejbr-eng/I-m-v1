-- Phase 1 foundation: support tickets and product feedback.

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger support_tickets_set_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();

alter table public.support_tickets enable row level security;

create policy support_tickets_select_own on public.support_tickets
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy support_tickets_insert_own on public.support_tickets
  for insert
  with check (user_id = auth.uid());

create policy support_tickets_admin_update on public.support_tickets
  for update
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  context text,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy feedback_select_own on public.feedback
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

create policy feedback_insert on public.feedback
  for insert
  with check (user_id = auth.uid() or user_id is null);
