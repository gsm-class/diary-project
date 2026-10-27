-- Run this in the Supabase SQL Editor (Dashboard → SQL) after creating the project.
-- Step 2: entries table, index, RLS, policies, updated_at trigger.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  body text not null,
  mood text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_user_id_created_at_idx
  on public.entries (user_id, created_at desc);

alter table public.entries enable row level security;

drop policy if exists "entries_select_own" on public.entries;
drop policy if exists "entries_insert_own" on public.entries;
drop policy if exists "entries_update_own" on public.entries;
drop policy if exists "entries_delete_own" on public.entries;

create policy "entries_select_own"
  on public.entries
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "entries_insert_own"
  on public.entries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "entries_update_own"
  on public.entries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "entries_delete_own"
  on public.entries
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_entries_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists entries_set_updated_at on public.entries;

create trigger entries_set_updated_at
  before update on public.entries
  for each row
  execute function public.set_entries_updated_at();
