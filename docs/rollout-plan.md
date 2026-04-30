# Rollout Plan

This document is the practical plan for getting The Finder's Log from local development into the hands of real people without chaos.

## Rollout Philosophy

Do not go from localhost to "the masses" in one jump.

Use controlled phases:

1. local hardening
2. hosted preview
3. private alpha
4. invite-only beta
5. public beta
6. paid launch

Each phase should answer a different question.

## Phase 1: Local Hardening

Goal:

- make sure the app is stable enough to stop wasting time on preventable bugs

Success criteria:

- build passes
- typecheck passes
- core journal flows work
- collection flows work
- profile flow is understandable

Work in this phase:

- backend parity for entries and collection
- auth/profile cleanup
- QA on refresh, edit, favorite, and navigation

## Phase 2: Hosted Preview

Goal:

- stop relying only on localhost

Recommended target:

- `Vercel` for app hosting
- `Supabase` for auth and database

Success criteria:

- app is reachable from a real URL
- auth callbacks work from hosted environments
- preview deployments exist for safe iteration

What to set up:

- production project in Vercel
- preview deployments from the repo
- environment variables for preview and production
- Supabase redirect URLs for both preview and production

## Phase 3: Private Alpha

Goal:

- test with a tiny group who will tolerate rough edges

Recommended audience size:

- 5 to 15 people

Who to invite:

- one pipe-heavy user
- one cigar-heavy user
- one whiskey-heavy user
- one mixed-use user
- one non-technical friend who will expose confusing language fast

What to learn:

- does account creation make sense?
- does cloud save feel trustworthy?
- do people understand quick vs full entry?
- does collection feel valuable or like extra work?

Success metrics:

- users can log at least one entry without help
- users can find their saved item again
- no recurring data-loss bug

## Phase 4: Invite-Only Beta

Goal:

- broaden usage while still controlling support load

Recommended audience size:

- 25 to 100 people

What to learn:

- which categories get used most
- which forms feel too long
- what catalog gaps show up repeatedly
- what breaks at modest traffic and data volume

Must-have before this phase:

- basic error tracking
- basic analytics
- reliable deployment process
- lightweight issue intake channel

## Phase 5: Public Beta

Goal:

- let the market touch it before monetization pressure

What to learn:

- does the product attract the right niche users?
- what is the retention pattern after first week?
- are profiles, entries, and collection sticky enough?

Suggested public-beta boundaries:

- free access
- limited promises
- clear "still evolving" positioning

## Phase 6: Paid Launch

Goal:

- introduce monetization only after trust is earned

Do not do this until:

- sync is stable
- account recovery is stable
- onboarding is clean
- support burden is manageable
- pricing model is clear

## Delivery Stack Recommendation

### Hosting

- `Vercel`

Why:

- easiest Next.js deployment path
- preview environments
- simple env management

### Database and Auth

- `Supabase`

Why:

- already chosen
- already partially wired
- good fit for private user data and relational catalog models

### Monitoring

- `Sentry` for errors
- `PostHog` or similar for product analytics

### Billing

- `Stripe`

Not needed immediately, but should be the likely paid-launch path.

## Release Process

For every release candidate:

1. run build and typecheck
2. smoke-test profile flow
3. smoke-test one quick and one full entry in each category
4. smoke-test collection add/edit in each room
5. verify Supabase-connected save/load
6. deploy preview
7. do a short human pass on mobile-size layouts

## First Public-Facing Messaging

When this goes out to real users, position it as:

- a premium personal journal for pipes, cigars, and spirits
- a private record of taste, collection, and ritual
- a tool for people who actually care about what they smoked or poured

Avoid launch messaging that sounds like:

- generic social app
- generic productivity tracker
- backend-heavy or technical account language

## Immediate Next Moves

1. finish cloud parity for journal + collection
2. deploy to hosted preview
3. install error tracking
4. install analytics
5. run private alpha
