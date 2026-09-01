-- ============================================================
-- Cosmira / My Astro — astrologer-side schema
-- Run this in Supabase → SQL Editor
-- ============================================================

-- 1) role column on users (astrologer | admin | user)
alter table public.users add column if not exists role text default 'user';

-- 2) astrologers table (profile linked to a Google sign-in email)
drop table if exists public.messages cascade;
drop table if exists public.payments cascade;
drop table if exists public.chats cascade;
drop table if exists public.astrologers cascade;
create table public.astrologers (
  id text primary key,
  email text not null,
  name text not null,
  avatar text,
  mobile text,
  rating numeric default 4.8,
  specialty text,
  location text,
  experience text,
  bio text,
  created_at timestamptz default now()
);

-- 3) chats (a consultation between a user and an astrologer)
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  astrologer_id text not null references public.astrologers(id),
  status text not null default 'active', -- active | closed
  created_at timestamptz default now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- 4) messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender text not null,           -- 'user' | 'astrologer'
  text text not null,
  created_at timestamptz default now()
);

-- 5) payments (records a paid consultation)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  astrologer_id text not null references public.astrologers(id),
  chat_id uuid references public.chats(id),
  amount numeric not null default 0,
  status text not null default 'paid', -- paid | refunded
  created_at timestamptz default now()
);

-- 6) real astrologers
insert into public.astrologers (id, email, name, avatar, mobile, rating, specialty, location, experience, bio) values
  ('a1', 'dineshmahi02@gmail.com', 'Pt. Dinesh', '', '', 4.9, 'Kundli, Horoscope, Vedic Astrology', 'Erode, India', '10+ years', 'Vedic astrology specialist with deep knowledge in kundli analysis and horoscope readings.'),
  ('a2', 'dinesh.mahi.dev@gmail.com', 'Astro Dinesh', '', '', 4.8, 'Match Making, Marriage, Compatibility', 'Erode, India', '8+ years', 'Expert in match making and relationship compatibility analysis.'),
  ('a3', 'monstermahid@gmail.com', 'Guru Mahid', '', '', 4.9, 'Career, Finance, Remedies', 'Chennai, India', '12+ years', 'Specialist in career guidance, financial astrology and traditional remedies.')
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  avatar = excluded.avatar,
  mobile = excluded.mobile,
  rating = excluded.rating,
  specialty = excluded.specialty,
  location = excluded.location,
  experience = excluded.experience,
  bio = excluded.bio;

-- 7) RLS: allow the anon/publishable key to read & write (app uses anon key)
alter table public.users enable row level security;
alter table public.astrologers enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;

drop policy if exists "users anon all" on public.users;
create policy "users anon all" on public.users for all using (true) with check (true);

drop policy if exists "astrologers anon all" on public.astrologers;
create policy "astrologers anon all" on public.astrologers for all using (true) with check (true);

drop policy if exists "chats anon all" on public.chats;
create policy "chats anon all" on public.chats for all using (true) with check (true);

drop policy if exists "messages anon all" on public.messages;
create policy "messages anon all" on public.messages for all using (true) with check (true);

drop policy if exists "payments anon all" on public.payments;
create policy "payments anon all" on public.payments for all using (true) with check (true);

-- 8) realtime for live chat
alter publication supabase_realtime add table public.chats;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.payments;