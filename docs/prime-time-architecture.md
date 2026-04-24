# The Finder's Log: Prime-Time Architecture

## Where We Are

The current product is a strong front-end prototype:

- Single static HTML entry point
- Client-side state and rendering
- Browser `localStorage` persistence
- No server, auth, payments, or multi-user support

That is good for product discovery, but it is not a production architecture.

## Target Architecture

The production target should be:

1. Frontend
   A typed React application with routing, component boundaries, test coverage, and API-backed persistence.

2. Backend
   A server/API layer responsible for auth, billing, user data, validation, and business rules.

3. Data
   A managed PostgreSQL database with migrations, backups, and auditability.

4. Auth
   Email/password plus magic-link or OAuth, with user-scoped data isolation.

5. Billing
   Stripe subscriptions and entitlements.

6. Observability
   Error tracking, request logging, analytics, and performance monitoring.

## Recommended Stack

This is the path I recommend:

- Frontend/server framework: `Next.js` with TypeScript
- Database: `PostgreSQL`
- ORM/migrations: `Drizzle ORM`
- Auth: `Supabase Auth` or `Auth.js`
- Billing: `Stripe`
- File/media storage: managed object storage only if needed later
- Error monitoring: `Sentry`
- Analytics: PostHog or a lightweight privacy-conscious alternative
- Hosting: Vercel, Fly.io, or another managed platform with preview environments

## Domain Model

The app is naturally split into these domains:

- `journal`
  Entries, filters, search, scoring, favorites
- `collection`
  Pipes, cigars, tins, bottles, statuses
- `wishlist`
  "Want to try" tracking
- `accounts`
  Profiles, preferences, onboarding
- `billing`
  Plans, entitlements, feature access

Those domains should become separate modules on both the frontend and backend.

## Migration Strategy

Do not throw away the working prototype. Migrate in stages:

1. Stabilize the current client codebase
   Separate config, storage, and domain logic from rendering.

2. Introduce an API contract
   Replace direct `localStorage` assumptions with a persistence adapter.

3. Build the real app shell
   Move the UI into a typed React codebase with reusable components.

4. Add auth and multi-user persistence
   Store journal and collection data server-side under user accounts.

5. Add billing and premium features
   Put subscriptions and entitlements behind server-side checks.

## Production Requirements

Before launch, we should have:

- Automated tests for core entry creation/edit/delete flows
- Input validation on client and server
- Structured database migrations
- Row-level or app-level access control
- Subscription entitlement checks
- Backups and restore strategy
- Error monitoring
- Basic analytics for onboarding and retention
- CI checks for lint, test, and build

## Current Transitional Foundation

As part of this repo, we are starting a transitional layer now:

- Centralized app config
- Persistence abstraction
- Environment variable template

That keeps the current prototype working while reducing rewrite risk.
