-- Run this in Supabase → SQL Editor to add session tracking
-- Safe to run multiple times (uses IF NOT EXISTS)

ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS ended_at timestamptz;
