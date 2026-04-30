-- The Finder's Log
-- Supabase-oriented bootstrap schema for the first real backend phase

create extension if not exists "pgcrypto";

create type entry_category as enum (
  'pipe',
  'cigar',
  'spirits'
);

create type catalog_type as enum (
  'pipes',
  'pipe_tobaccos',
  'cigars',
  'spirits'
);

create type catalog_status as enum (
  'active',
  'discontinued',
  'limited',
  'seasonal'
);

create type catalog_source as enum (
  'seed',
  'user',
  'promoted'
);

create table if not exists user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'America/New_York',
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists catalog_brand (
  id uuid primary key default gen_random_uuid(),
  catalog_type catalog_type not null,
  name text not null,
  normalized_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  status catalog_status not null default 'active',
  source catalog_source not null default 'seed',
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists catalog_brand_type_name_idx
  on catalog_brand(catalog_type, normalized_name);

create table if not exists catalog_item (
  id uuid primary key default gen_random_uuid(),
  catalog_type catalog_type not null,
  brand_id uuid references catalog_brand(id) on delete set null,
  name text not null,
  normalized_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  status catalog_status not null default 'active',
  source catalog_source not null default 'seed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists catalog_item_type_brand_name_idx
  on catalog_item(catalog_type, coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid), normalized_name);

create table if not exists user_catalog_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_type catalog_type not null,
  brand_name text,
  item_name text not null,
  normalized_item_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  promoted_catalog_item_id uuid references catalog_item(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_catalog_item_user_type_idx on user_catalog_item(user_id, catalog_type);
create index if not exists user_catalog_item_user_name_idx on user_catalog_item(user_id, normalized_item_name);

create table if not exists user_catalog_brand (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_type catalog_type not null,
  name text not null,
  normalized_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_catalog_brand_user_type_idx on user_catalog_brand(user_id, catalog_type);
create unique index if not exists user_catalog_brand_user_name_idx
  on user_catalog_brand(user_id, catalog_type, normalized_name);

create table if not exists journal_entry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category entry_category not null,
  title text not null,
  entry_date date,
  time_of_day text,
  location text,
  tags jsonb not null default '[]'::jsonb,
  is_favorite boolean not null default false,
  suggested_score numeric(3,1),
  final_score numeric(3,1),
  use_final_override boolean not null default false,
  overall_thoughts text,
  quick_notes text,
  catalog_refs jsonb not null default '{}'::jsonb,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entry_user_category_idx on journal_entry(user_id, category);
create index if not exists journal_entry_user_entry_date_idx on journal_entry(user_id, entry_date desc);
create index if not exists journal_entry_user_favorite_idx on journal_entry(user_id, is_favorite);

create table if not exists pipe_entry_draft (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table user_profile enable row level security;
alter table catalog_brand enable row level security;
alter table catalog_item enable row level security;
alter table user_catalog_brand enable row level security;
alter table user_catalog_item enable row level security;
alter table journal_entry enable row level security;
alter table pipe_entry_draft enable row level security;

create policy "user_profile_select_own"
  on user_profile
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_profile_insert_own"
  on user_profile
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_profile_update_own"
  on user_profile
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "catalog_brand_read_authenticated"
  on catalog_brand
  for select
  to authenticated
  using (true);

create policy "catalog_item_read_authenticated"
  on catalog_item
  for select
  to authenticated
  using (true);

create policy "user_catalog_item_select_own"
  on user_catalog_item
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_catalog_item_insert_own"
  on user_catalog_item
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_catalog_item_update_own"
  on user_catalog_item
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_catalog_item_delete_own"
  on user_catalog_item
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_catalog_brand_select_own"
  on user_catalog_brand
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_catalog_brand_insert_own"
  on user_catalog_brand
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "user_catalog_brand_update_own"
  on user_catalog_brand
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_catalog_brand_delete_own"
  on user_catalog_brand
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "journal_entry_select_own"
  on journal_entry
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "journal_entry_insert_own"
  on journal_entry
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "journal_entry_update_own"
  on journal_entry
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "journal_entry_delete_own"
  on journal_entry
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "pipe_entry_draft_select_own"
  on pipe_entry_draft
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "pipe_entry_draft_insert_own"
  on pipe_entry_draft
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "pipe_entry_draft_update_own"
  on pipe_entry_draft
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "pipe_entry_draft_delete_own"
  on pipe_entry_draft
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
