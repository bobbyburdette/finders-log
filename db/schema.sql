-- The Finder's Log
-- Production-oriented PostgreSQL schema draft

create extension if not exists "pgcrypto";

create type subscription_status as enum (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete'
);

create type entry_category as enum (
  'pipe',
  'cigar',
  'spirits'
);

create type collection_category as enum (
  'pipe',
  'tin',
  'cigar',
  'bottle',
  'lighter'
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

create table app_user (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_profile (
  user_id uuid primary key references app_user(id) on delete cascade,
  avatar_url text,
  bio text,
  favorite_pipe_styles jsonb not null default '[]'::jsonb,
  favorite_spirit_types jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table catalog_brand (
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

create unique index catalog_brand_type_name_idx
  on catalog_brand(catalog_type, normalized_name);

create table catalog_item (
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

create unique index catalog_item_type_brand_name_idx
  on catalog_item(catalog_type, coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid), normalized_name);

create table user_catalog_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  catalog_type catalog_type not null,
  brand_name text,
  item_name text not null,
  normalized_item_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  promoted_catalog_item_id uuid references catalog_item(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_catalog_item_user_type_idx on user_catalog_item(user_id, catalog_type);
create index user_catalog_item_user_name_idx on user_catalog_item(user_id, normalized_item_name);

create table user_catalog_brand (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  catalog_type catalog_type not null,
  name text not null,
  normalized_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_catalog_brand_user_type_idx on user_catalog_brand(user_id, catalog_type);
create unique index user_catalog_brand_user_name_idx on user_catalog_brand(user_id, catalog_type, normalized_name);

create table billing_customer (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references app_user(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscription (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status subscription_status not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscription_user_id_idx on subscription(user_id);

create table journal_entry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
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
  search_document tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entry_user_category_idx on journal_entry(user_id, category);
create index journal_entry_user_entry_date_idx on journal_entry(user_id, entry_date desc);
create index journal_entry_user_favorite_idx on journal_entry(user_id, is_favorite);
create index journal_entry_search_document_idx on journal_entry using gin(search_document);

create table collection_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  category collection_category not null,
  name text not null,
  status text,
  quantity integer,
  acquired_on date,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index collection_item_user_category_idx on collection_item(user_id, category);
create index collection_item_user_name_idx on collection_item(user_id, name);

create table wishlist_item (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  category entry_category not null,
  name text not null,
  notes text,
  priority smallint not null default 3 check (priority between 1 and 5),
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wishlist_item_user_category_idx on wishlist_item(user_id, category);
create index wishlist_item_user_fulfilled_idx on wishlist_item(user_id, fulfilled_at);

create table audit_event (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_event_user_id_idx on audit_event(user_id);
create index audit_event_entity_idx on audit_event(entity_type, entity_id);
