-- Run this once in Supabase SQL Editor. Storage bucket: documents (private).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '', email text not null default '', location text default '',
  age text default '', occupation text default '', income text default '', category text default '',
  gender text, state text, district text, pincode text, annual_income text, education_level text, disability_status text, marital_status text, is_student text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, type text not null default 'Other document', storage_path text not null,
  status text not null default 'Pending', detected_information jsonb default '{}'::jsonb,
  uploaded_at timestamptz not null default now()
);
create table if not exists public.document_analysis (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, extracted_data jsonb not null default '{}'::jsonb,
  confidence numeric, issues text[] default '{}', created_at timestamptz not null default now()
);
create table if not exists public.saved_schemes (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id text not null, created_at timestamptz not null default now(), unique(user_id, scheme_id)
);
create table if not exists public.user_scheme_matches (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  scheme_id text not null, match_score numeric, created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, message text not null, read boolean not null default false, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.document_analysis enable row level security;
alter table public.saved_schemes enable row level security;
alter table public.user_scheme_matches enable row level security;
alter table public.notifications enable row level security;

create policy "users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users manage own documents" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own analysis" on public.document_analysis for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own saved schemes" on public.saved_schemes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own matches" on public.user_scheme_matches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own notifications" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
create policy "users access own document files" on storage.objects for all using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, name, email) values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.email) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
