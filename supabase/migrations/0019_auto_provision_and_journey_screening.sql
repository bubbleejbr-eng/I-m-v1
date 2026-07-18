-- Phase 2: auto-provision a profile + default 'client' role when a new
-- auth user is created. Without this, no client could ever obtain the
-- 'client' role at all, since user_roles is intentionally
-- admin-write-only (see 0001_extensions_and_helpers.sql) — a client can
-- never insert their own role row. This trigger is the one sanctioned
-- exception: it runs as security definer, fires only on auth.users
-- insert (which only Supabase Auth itself can do), and always grants
-- exactly 'client', never a higher-privilege role.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Tracks whether the onboarding urgency/safety screening step (Step 5)
-- has been completed for a journey, so the onboarding wizard knows
-- whether to show it again on return.
alter table public.immigration_journeys
  add column urgency_screening_completed_at timestamptz;
