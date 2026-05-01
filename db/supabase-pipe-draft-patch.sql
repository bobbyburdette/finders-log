-- Pipe draft catch-up patch for existing Supabase projects
-- Run this if profile auth works but saving the current pipe draft still fails.

create table if not exists pipe_entry_draft (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table pipe_entry_draft enable row level security;

drop policy if exists "pipe_entry_draft_select_own" on pipe_entry_draft;
create policy "pipe_entry_draft_select_own"
  on pipe_entry_draft
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "pipe_entry_draft_insert_own" on pipe_entry_draft;
create policy "pipe_entry_draft_insert_own"
  on pipe_entry_draft
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "pipe_entry_draft_update_own" on pipe_entry_draft;
create policy "pipe_entry_draft_update_own"
  on pipe_entry_draft
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "pipe_entry_draft_delete_own" on pipe_entry_draft;
create policy "pipe_entry_draft_delete_own"
  on pipe_entry_draft
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
