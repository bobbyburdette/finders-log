# Backend Foundation Decision

## Recommendation

The first real backend target for The Finder's Log should be:

- `Supabase` for auth, Postgres, row-level security, and storage primitives
- `Next.js` route handlers/server actions for app-specific orchestration
- `Stripe` for billing

That gives us the fastest path from prototype to a real multi-user product without forcing us to run our own database and auth stack from day one.

## Why This Fits The Product

The app needs:

- private user journals
- account-based sync across devices
- structured catalog data
- a scalable relational database
- secure per-user access rules
- room for subscriptions later

Supabase maps well to that because it combines managed Postgres, auth, and row-level security. We can keep the product logic in our own app while letting Supabase handle the heavy lifting around identity and data isolation.

## Current Transitional Shape

Right now the app runs in `browser` mode:

- `catalogService`
- `pipeEntryService`
- browser repository persistence

Those are intentionally shaped so we can later swap to `supabase` mode in one place instead of rewriting screens.

Code seams:

- backend selection: [src/lib/backend-config.ts](src/lib/backend-config.ts)
- service factory: [src/lib/services/service-factory.ts](src/lib/services/service-factory.ts)
- browser repository: [src/lib/data/pipe-journal-repository.ts](src/lib/data/pipe-journal-repository.ts)
- Supabase SSR utilities:
  - [src/lib/supabase/client.ts](src/lib/supabase/client.ts)
  - [src/lib/supabase/server.ts](src/lib/supabase/server.ts)
  - [src/lib/supabase/proxy.ts](src/lib/supabase/proxy.ts)
  - [proxy.ts](proxy.ts)
- remote-ready services:
  - [src/lib/services/remote/catalog-service.ts](src/lib/services/remote/catalog-service.ts)
  - [src/lib/services/remote/pipe-entry-service.ts](src/lib/services/remote/pipe-entry-service.ts)
- placeholder API routes:
  - [src/app/api/v1/backend/status/route.ts](src/app/api/v1/backend/status/route.ts)
  - [src/app/api/v1/catalog/user/route.ts](src/app/api/v1/catalog/user/route.ts)
  - [src/app/api/v1/pipe-entries/route.ts](src/app/api/v1/pipe-entries/route.ts)
  - [src/app/api/v1/pipe-draft/route.ts](src/app/api/v1/pipe-draft/route.ts)

## Production Data Direction

The durable production direction should be:

1. `auth.users` in Supabase owns identity
2. app tables reference the authenticated user id
3. shared catalog tables are curated separately from user-added items
4. row-level security keeps journal and collection data private per user
5. approved user submissions can be promoted into the shared catalog

## Near-Term Migration Steps

1. Keep the UI on browser-backed services while the flows settle
2. Add Supabase-backed implementations for `catalogService` and `pipeEntryService`
3. Move pipe entries, drafts, and user catalog items into real tables
4. Add auth and user-scoped policies
5. Migrate cigars, spirits, and collection onto the same service model

## Official Supabase Notes

Based on current official Supabase Next.js SSR guidance:

- use `@supabase/supabase-js` plus `@supabase/ssr`
- create separate browser and server clients
- use a root `proxy.ts` to refresh auth cookies
- prefer the publishable key, while legacy anon keys still work during the transition period

## What We Are Avoiding

We are intentionally not:

- building a giant custom backend too early
- coupling screens directly to `localStorage`
- auto-promoting user-created catalog items into the global catalog
- locking ourselves into a static flat-file catalog
