-- ============================================================
-- Secrets table for API keys (Groq, etc.)
-- Run this in Supabase → SQL Editor
-- ============================================================

create table if not exists public.secrets (
  key text primary key,
  value text not null,
  created_at timestamptz default now()
);

alter table public.secrets enable row level security;

drop policy if exists "secrets anon all" on public.secrets;
create policy "secrets anon all" on public.secrets for all using (true) with check (true);

insert into public.secrets (key, value) values
  ('groq_api_key', 'YOUR_GROQ_API_KEY_HERE')
on conflict (key) do update set value = excluded.value;
