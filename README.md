# The Finder's Log

The Finder's Log is a private, mobile-first journal for pipes, cigars, spirits, and the collections around them.

## Current Product

The production app lives in `src/` and includes:

- quick and full journal entries for pipes, cigars, and spirits
- search, sorting, favorites, detail, editing, and deletion
- humidor, cellar, pipe-rack, bar, and wishlist management
- browser-backed offline persistence
- optional Supabase authentication and cross-device persistence

The original static prototype remains in `index.html` and `assets/` as a visual reference. New product work belongs in the Next.js app.

## Local Development

Requirements:

- Node.js 20 or newer
- npm

```bash
npm ci
npm run dev
```

The app opens at `http://localhost:3000`.

Without Supabase environment variables, it intentionally runs in browser-only mode.

## Quality Checks

```bash
npm run check
```

This runs TypeScript, ESLint, focused automated tests, and the production build.

## Data Modes

- `NEXT_PUBLIC_DATA_PROVIDER=browser`
  Uses local browser persistence.
- `NEXT_PUBLIC_DATA_PROVIDER=supabase`
  Uses the authenticated API and Supabase-backed persistence when valid Supabase variables are present.

Start with `.env.local.example` when reconnecting a Supabase project.

## Planning and Operations

- [Launch readiness](docs/launch-readiness.md)
- [Rollout plan](docs/rollout-plan.md)
- [Supabase setup](docs/supabase-project-setup.md)
- [Vercel deployment](docs/vercel-deployment.md)
- [Architecture](docs/prime-time-architecture.md)

## Immediate Release Goal

Verify authentication and conflict-safe synchronization on a hosted preview across two devices, then invite a small private-alpha group.
