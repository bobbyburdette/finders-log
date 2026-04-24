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
  'whiskey'
);

create type collection_category as enum (
  'pipe',
  'tin',
  'cigar',
  'bottle',
  'lighter'
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
