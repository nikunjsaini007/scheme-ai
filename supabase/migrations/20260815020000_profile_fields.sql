-- Add missing profile fields for recommendation eligibility evaluation
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists district text;
alter table public.profiles add column if not exists pincode text;
alter table public.profiles add column if not exists annual_income text;
alter table public.profiles add column if not exists education_level text;
alter table public.profiles add column if not exists disability_status text;
alter table public.profiles add column if not exists marital_status text;
alter table public.profiles add column if not exists is_student text;