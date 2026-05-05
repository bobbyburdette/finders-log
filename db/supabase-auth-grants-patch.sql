-- The Finder's Log
-- Grants required for authenticated Supabase API access to app tables.
-- Run this in the Supabase SQL editor for the hosted project.

grant usage on schema public to authenticated;

grant select on table public.catalog_brand to authenticated;
grant select on table public.catalog_item to authenticated;

grant select, insert, update, delete on table public.user_profile to authenticated;
grant select, insert, update, delete on table public.user_catalog_brand to authenticated;
grant select, insert, update, delete on table public.user_catalog_item to authenticated;
grant select, insert, update, delete on table public.journal_entry to authenticated;
grant select, insert, update, delete on table public.pipe_entry_draft to authenticated;
grant select, insert, update, delete on table public.collection_item to authenticated;
grant select, insert, update, delete on table public.wishlist_item to authenticated;

grant all privileges on table public.user_profile to service_role;
grant all privileges on table public.catalog_brand to service_role;
grant all privileges on table public.catalog_item to service_role;
grant all privileges on table public.user_catalog_brand to service_role;
grant all privileges on table public.user_catalog_item to service_role;
grant all privileges on table public.journal_entry to service_role;
grant all privileges on table public.pipe_entry_draft to service_role;
grant all privileges on table public.collection_item to service_role;
grant all privileges on table public.wishlist_item to service_role;
