-- Collection catch-up patch for existing Supabase projects
-- Run this in Supabase SQL Editor if auth works but collection sync is missing.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'collection_category') then
    create type collection_category as enum (
      'pipe',
      'tin',
      'cigar',
      'bottle',
      'lighter'
    );
  end if;
end $$;

create table if not exists collection_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category collection_category not null,
  name text not null,
  status text,
  quantity integer,
  acquired_on date,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collection_item_user_category_idx on collection_item(user_id, category);
create index if not exists collection_item_user_name_idx on collection_item(user_id, name);

create table if not exists wishlist_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category entry_category not null,
  name text not null,
  notes text,
  priority smallint not null default 3 check (priority between 1 and 5),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishlist_item_user_category_idx on wishlist_item(user_id, category);
create index if not exists wishlist_item_user_fulfilled_idx on wishlist_item(user_id, fulfilled_at);

alter table collection_item enable row level security;
alter table wishlist_item enable row level security;

drop policy if exists "collection_item_select_own" on collection_item;
create policy "collection_item_select_own"
  on collection_item
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "collection_item_insert_own" on collection_item;
create policy "collection_item_insert_own"
  on collection_item
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "collection_item_update_own" on collection_item;
create policy "collection_item_update_own"
  on collection_item
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "collection_item_delete_own" on collection_item;
create policy "collection_item_delete_own"
  on collection_item
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "wishlist_item_select_own" on wishlist_item;
create policy "wishlist_item_select_own"
  on wishlist_item
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "wishlist_item_insert_own" on wishlist_item;
create policy "wishlist_item_insert_own"
  on wishlist_item
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "wishlist_item_update_own" on wishlist_item;
create policy "wishlist_item_update_own"
  on wishlist_item
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "wishlist_item_delete_own" on wishlist_item;
create policy "wishlist_item_delete_own"
  on wishlist_item
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
