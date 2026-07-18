-- Phase 1 foundation: platform-wide and brand configuration, editable
-- only by platform administrators. The frontend's static
-- src/content/brand.ts remains the source of truth until the admin
-- brand editor (Phase 6+) reads from brand_settings instead.

create table public.platform_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create trigger platform_settings_set_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();

alter table public.platform_settings enable row level security;

create policy platform_settings_admin_only on public.platform_settings
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create table public.brand_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null default 'Anaya Global Holdings',
  product_name text not null default 'AGH American Immigration',
  tagline_primary text not null default 'Your guided U.S. immigration application workspace.',
  tagline_secondary text not null default 'Prepare with confidence. Review before filing. Get professional help when you need it.',
  color_tokens jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

create trigger brand_settings_set_updated_at
  before update on public.brand_settings
  for each row execute function public.set_updated_at();

alter table public.brand_settings enable row level security;

create policy brand_settings_admin_only on public.brand_settings
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());
