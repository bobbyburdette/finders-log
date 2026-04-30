# Vercel Deployment Guide

This is the simplest path to get The Finder's Log off localhost and onto a real preview URL.

## What Vercel Is Doing For Us

`Vercel` will host the Next.js app and give us:

- a real URL
- preview deployments for changes
- production deployment when we are ready
- environment variable management

## Before You Start

Make sure these already exist:

- GitHub repo for the project
- Supabase project
- working local `.env.local`

## Step 1: Create The Vercel Project

1. Go to [Vercel](https://vercel.com/)
2. Sign in with GitHub
3. Import the `finders-log` repository
4. Keep the framework as `Next.js`
5. Do not over-customize build settings unless something breaks

For this repo, the default Vercel Next.js settings should be enough.

## Step 2: Add Environment Variables

In the Vercel project settings, add these variables for both `Preview` and `Production` as appropriate:

- `APP_NAME`
- `APP_ENV`
- `NEXT_PUBLIC_DATA_PROVIDER`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

Recommended values:

### Preview

- `APP_ENV=preview`
- `NEXT_PUBLIC_DATA_PROVIDER=supabase`
- `NEXT_PUBLIC_API_BASE_URL=`
  Leave blank so the app uses the same deployed origin
- `NEXT_PUBLIC_SITE_URL=https://your-preview-or-production-url`
  Use the exact hosted URL if you are setting production

### Production

- `APP_ENV=production`
- `NEXT_PUBLIC_DATA_PROVIDER=supabase`
- `NEXT_PUBLIC_API_BASE_URL=`
- `NEXT_PUBLIC_SITE_URL=https://your-real-domain.com`

## Step 3: Configure Supabase Auth Redirects

In Supabase:

1. Open `Authentication`
2. Open `URL Configuration`
3. Set the main `Site URL`
4. Add redirect URLs for:
   - your production domain
   - your Vercel preview domain pattern
   - local development callback

Recommended redirects:

- `http://localhost:3000/auth/callback`
- `http://localhost:3001/auth/callback`
- `http://localhost:3002/auth/callback`
- `https://your-production-domain.com/auth/callback`
- `https://*-your-vercel-project.vercel.app/auth/callback`

If Vercel gives you a different preview domain pattern, use that exact shape.

## Step 4: Deploy A Hosted Preview

Once env vars are set:

1. trigger a deployment in Vercel
2. open the hosted preview URL
3. test profile creation
4. test magic-link login
5. test journal save/load
6. test collection save/load

## Step 5: Verify The High-Risk Paths

On the hosted preview, test:

- create profile
- open magic link
- land back in the app correctly
- create one pipe entry
- create one cigar entry
- create one spirit entry
- add one cigar to collection
- add one tobacco to collection
- refresh and confirm data still exists

## Step 6: Prepare Production

Only after preview is stable:

1. connect your real domain in Vercel
2. update `NEXT_PUBLIC_SITE_URL`
3. update Supabase `Site URL`
4. add the production auth callback URL
5. redeploy

## Recommended First Rollout

Use Vercel preview for:

- your own testing
- one or two trusted testers

Do not announce publicly yet.

The goal of this stage is:

- fix auth and sync issues
- catch weird mobile-browser behavior
- verify the app feels trustworthy on a real hosted URL

## Notes For This Repo

This app now has two important deployment-friendly behaviors:

- API calls can use the current origin when `NEXT_PUBLIC_API_BASE_URL` is blank
- auth magic links prefer `NEXT_PUBLIC_SITE_URL` for callback redirects

That makes localhost, preview, and production much easier to manage cleanly.
