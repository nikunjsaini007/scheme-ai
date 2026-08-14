create table if not exists public.schemes (
  id text primary key,
  name text not null,
  description text not null,
  ministry text not null,
  category text not null,
  level text not null check (level in ('Central', 'State')),
  state text,
  benefits text[] not null default '{}',
  eligibility text[] not null default '{}',
  documents_required text[] not null default '{}',
  application_url text not null,
  status text not null check (status in ('active', 'current', 'inactive')),
  last_verified_at timestamptz not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Extend an existing legacy schemes table in place.
alter table public.schemes add column if not exists description text not null default '';
alter table public.schemes add column if not exists ministry text not null default '';
alter table public.schemes add column if not exists category text not null default 'Other';
alter table public.schemes add column if not exists level text not null default 'Central';
alter table public.schemes add column if not exists state text;
alter table public.schemes add column if not exists benefits text[] not null default '{}';
alter table public.schemes add column if not exists eligibility text[] not null default '{}';
alter table public.schemes add column if not exists documents_required text[] not null default '{}';
alter table public.schemes add column if not exists application_url text not null default '';
alter table public.schemes add column if not exists status text not null default 'inactive';
alter table public.schemes add column if not exists last_verified_at timestamptz not null default now();
alter table public.schemes add column if not exists source_url text not null default '';
alter table public.schemes add column if not exists updated_at timestamptz not null default now();

alter table public.schemes enable row level security;
drop policy if exists "anyone can view current schemes" on public.schemes;
create policy "anyone can view current schemes" on public.schemes for select using (status in ('active', 'current'));

create table if not exists public.scheme_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id text not null,
  scheme_name text not null,
  ministry_or_department text not null,
  government_level text not null,
  state text,
  category text not null,
  short_description text not null,
  match_score numeric not null check (match_score >= 0 and match_score <= 100),
  match_band text not null check (match_band in ('strong', 'good', 'possible')),
  why_matches text[] not null default '{}',
  missing_requirements text[] not null default '{}',
  eligibility_summary text[] not null default '{}',
  benefits text[] not null default '{}',
  required_documents text[] not null default '{}',
  application_process text[] not null default '{}',
  official_application_url text not null,
  official_source_url text not null,
  status text not null,
  last_verified_at timestamptz not null,
  confidence_score numeric not null check (confidence_score >= 0 and confidence_score <= 1),
  generated_at timestamptz not null default now()
);

alter table public.scheme_recommendations enable row level security;
drop policy if exists "users view own recommendations" on public.scheme_recommendations;
create policy "users view own recommendations" on public.scheme_recommendations for select using (auth.uid() = user_id);
drop policy if exists "users delete own recommendations" on public.scheme_recommendations;
create policy "users delete own recommendations" on public.scheme_recommendations for delete using (auth.uid() = user_id);
drop policy if exists "users insert own recommendations" on public.scheme_recommendations;
create policy "users insert own recommendations" on public.scheme_recommendations for insert with check (auth.uid() = user_id);

insert into public.schemes (
  id, name, scheme_type, description, ministry, category, level, state, benefits, eligibility,
  documents_required, application_url, status, last_verified_at, source_url
) values (
  '00000000-0000-0000-0000-000000000001',
  'PM-KISAN Samman Nidhi',
  'Central Government',
  'Income support for landholding farmer families through direct benefit transfers.',
  'Department of Agriculture and Farmers Welfare, Ministry of Agriculture and Farmers Welfare',
  'Agriculture',
  'Central',
  null,
  array['₹6,000 per year in three equal instalments'],
  array['Landholding farmer family', 'Subject to the official exclusion categories', 'State/UT identification and verification'],
  array['Aadhaar or approved identity documents', 'Land records', 'Bank account details'],
  'https://pmkisan.gov.in/',
  'current',
  now(),
  'https://pmkisan.gov.in/'
) on conflict (id) do update set
  name = excluded.name,
  scheme_type = excluded.scheme_type,
  description = excluded.description,
  ministry = excluded.ministry,
  category = excluded.category,
  level = excluded.level,
  state = excluded.state,
  benefits = excluded.benefits,
  eligibility = excluded.eligibility,
  documents_required = excluded.documents_required,
  application_url = excluded.application_url,
  status = excluded.status,
  last_verified_at = excluded.last_verified_at,
  source_url = excluded.source_url,
  updated_at = now();
