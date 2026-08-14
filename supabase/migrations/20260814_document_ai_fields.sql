-- Safe additive migration. Run only if these columns are not already present.
alter table public.documents add column if not exists document_type text;
alter table public.documents add column if not exists ai_analyzed boolean not null default false;
alter table public.documents add column if not exists ai_confidence numeric;
alter table public.documents add column if not exists ai_summary text;
alter table public.documents add column if not exists extracted_data jsonb;
alter table public.documents add column if not exists is_valid boolean;
alter table public.documents add column if not exists validation_message text;
alter table public.documents add column if not exists analyzed_at timestamptz;
