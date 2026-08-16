-- Fix schema gaps: add missing columns referenced by application code
-- This migration must run BEFORE the seed data migrations that reference scheme_type

-- schemes table: add scheme_type column (referenced by seed migrations 20260815000000 and 20260815010000)
alter table public.schemes add column if not exists scheme_type text default '';

-- profiles table: add full_name column (used by normalizeProfileForDatabase and UI)
alter table public.profiles add column if not exists full_name text default '';

-- profiles table: ensure preferred_language column exists
alter table public.profiles add column if not exists preferred_language text default 'english';

-- profiles table: ensure profile_completed column exists
alter table public.profiles add column if not exists profile_completed boolean default false;
