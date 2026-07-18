-- Phase 1 foundation: payment and refund tracking, test mode only.
-- Clients may view their own payment history but can never write or
-- change a payment's status — only a server-side Stripe-webhook-driven
-- process (service role, bypassing RLS) may do that.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.immigration_journeys (id) on delete cascade,
  review_request_id uuid references public.review_requests (id),
  review_product_id uuid references public.review_products (id),
  amount_cents integer not null,
  currency text not null default 'usd',
  is_test_mode boolean not null default true,
  is_sponsored boolean not null default false,
  is_subsidized boolean not null default false,
  stripe_payment_intent_id text,
  status text not null default 'pending' check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create index payments_journey_idx on public.payments (journey_id);

alter table public.payments enable row level security;

create policy payments_select_own on public.payments
  for select
  using (public.owns_journey(journey_id) or public.is_platform_admin());

create policy payments_admin_write on public.payments
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  amount_cents integer not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger refunds_set_updated_at
  before update on public.refunds
  for each row execute function public.set_updated_at();

alter table public.refunds enable row level security;

create policy refunds_select_own on public.refunds
  for select
  using (
    exists (
      select 1 from public.payments p
      where p.id = payment_id and (public.owns_journey(p.journey_id) or public.is_platform_admin())
    )
  );

create policy refunds_admin_write on public.refunds
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
