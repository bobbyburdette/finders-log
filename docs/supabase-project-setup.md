# Supabase Project Setup

## What This Is

This is the first practical setup path for moving The Finder's Log from browser-only storage into a real cloud backend.

You do **not** need to understand all the infrastructure details. The goal is simple:

1. create a Supabase project
2. copy a few values into local env
3. run the first database bootstrap SQL
4. keep building on a real backend foundation

## What You Will Need

- a Supabase account
- a new Supabase project
- the project URL
- the publishable key
- the service role key
- the database password if you later connect direct SQL tooling

## Environment File

Use this repo file as your starting point:

- [.env.local.example](/Users/bobby.burdette/Pipe%20Journal/.env.local.example)

Create a local file named `.env.local` in the project root and paste in your real values.

The most important ones are:

- `NEXT_PUBLIC_DATA_PROVIDER=supabase`
- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

## Database Bootstrap

For the first Supabase-backed phase, use:

- [db/supabase-bootstrap.sql](/Users/bobby.burdette/Pipe%20Journal/db/supabase-bootstrap.sql)

This SQL file is designed for Supabase specifically. It:

- uses `auth.users` for identity
- creates the first shared catalog tables
- creates user catalog items
- creates journal entries
- creates a pipe draft table
- enables row-level security
- adds starter policies so users only see their own private data

## Recommended Order

1. Create the Supabase project
2. Open the SQL editor in Supabase
3. Run `db/supabase-bootstrap.sql`
4. Create `.env.local` from `.env.local.example`
5. Restart the app
6. Switch the provider to `supabase`
7. Check backend status route

## Social Login Redirects

In Supabase, enable each social provider you want to show in the app:

- Google
- Apple
- Facebook

Add these redirect URLs in the Supabase auth URL configuration:

- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback` if local dev moves to port `3001`
- your hosted preview callback URL
- your production callback URL

The app sends users back to `/auth/callback` after social login or email magic-link login. The callback exchanges the Supabase auth code, returns the user to the profile screen, and displays provider errors there if Supabase sends one back.

## How To Tell If It Is Working

This route should help once env is filled in:

- `/api/v1/backend/status`

It will tell us whether:

- browser mode is still active
- Supabase keys are configured
- a signed-in user is available

## Important Current Limitation

The Supabase auth/client wiring is now installed, but the actual journal routes are still not writing real rows yet.

So after setup, the next implementation task will be:

1. connect `pipe-entries` route to Supabase
2. connect `pipe-draft` route to Supabase
3. connect `user catalog` route to Supabase

## Why This Matters

Once this is connected, the app can grow toward:

- real accounts
- multi-device sync
- private user data
- production-ready scaling
- subscriptions later
