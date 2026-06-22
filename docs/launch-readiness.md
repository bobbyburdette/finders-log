# Launch Readiness

This document turns the current product into a shipping checklist instead of a loose idea.

## Current Position

The app is no longer just a prototype.

Last verified locally: June 2026.

It already has:

- strong mobile-first UX for `Pipe`, `Cigar`, and `Spirits`
- quick/full entry flows
- detail/edit flows for entries
- favorites
- collection inventory and wishlist flows
- profile/settings home
- Supabase project setup and bootstrap schema
- backend lanes for journal and collection
- automated date/sort and sync-reconciliation tests
- lint, typecheck, test, and production-build quality gates

It does **not** yet have enough hardening to treat as a public launch.

## What "Ready" Means

For this app, launch-ready means:

- users can create an account and recover it cleanly
- journal entries and collection items save reliably across devices
- editing never creates accidental duplicates
- signed-in and signed-out behavior is predictable
- core flows survive refresh, reconnect, and browser changes
- deployment, monitoring, and support are in place

## Product Completeness

### Must Be True Before Private Alpha

- `Pipe`, `Cigar`, and `Spirits` quick/full flows all save and reload correctly
- entry detail/edit behaves correctly for quick vs full mode
- collection add/detail/edit works for cigars, tobacco, pipes, and bottles
- search, favorites, and sort feel dependable
- profile setup is understandable and does not leak backend language

### Must Be True Before Public Beta

- seed catalog feels smart enough on first use
- add-custom fallback works cleanly in entries and collection
- empty states and recovery states feel intentional
- destructive actions like delete/archive are designed and tested
- light onboarding explains the app without getting in the way

### Nice To Have After Beta

- item photos
- export/import
- richer stats and history
- premium or paid features

## Backend Reliability

### Must Be True Before Private Alpha

- Supabase auth works end to end
- journal save/load works in the cloud for signed-in users
- collection save/load works in the cloud for signed-in users
- local fallback does not silently overwrite cloud data
- user-scoped records stay private

### Must Be True Before Public Beta

- first sign-in sync path is tested
- local-to-cloud reconciliation is predictable
- retry/failure states are visible and not confusing
- schema changes are handled with migrations, not manual patching
- one reliable source of truth exists for each domain

### Must Be True Before Paid Launch

- backups and restore story is documented
- monitoring exists for API failures and auth failures
- support/debug logging is in place for rollout issues
- billing and entitlement checks are server-enforced

## Launch Readiness Checklist

### Accounts

- [ ] Create profile flow is polished
- [ ] Magic-link login callback is tested on real hosted URLs
- [ ] Sign-out works cleanly
- [ ] Signed-in state survives refresh
- [ ] Signed-out users are prompted at the right moments, not too early

### Journal

- [ ] Pipe entries cloud-save correctly
- [ ] Cigar entries cloud-save correctly
- [ ] Spirit entries cloud-save correctly
- [ ] Quick/full edit mode is preserved for all categories
- [ ] Favorites persist correctly

### Collection

- [ ] Collection items cloud-save correctly
- [ ] Wishlists cloud-save correctly
- [ ] Detail/edit works for all collection categories
- [ ] Compact rows and detail pages stay in sync after edits

### Delivery

- [ ] Production deployment target is chosen
- [ ] Environment variables are documented for local, preview, and production
- [ ] Auth redirect URLs are configured for hosted environments
- [x] Local build, typecheck, lint, and focused automated tests pass
- [ ] Hosted smoke test passes before each release

### Monitoring

- [ ] Error tracking is installed
- [ ] Basic product analytics are installed
- [ ] Release owner knows where to check auth, API, and sync issues

## Recommended Next Engineering Phase

The highest-value next phase is:

1. verify cloud parity and reconciliation against a real Supabase project
2. deploy to a real hosted preview
3. test sign-in and conflicting changes across two devices
4. invite a very small tester group
5. fix what breaks

## Release Gates

### Private Alpha

Invite a tiny hand-picked group only when:

- core save/load is trustworthy
- account setup works
- data is not getting lost
- the app is enjoyable enough that feedback is about product, not survival

### Public Beta

Open it wider only when:

- cloud save is stable
- error rate is low
- onboarding and profile flows are clear
- catalog coverage is good enough for first-time delight

### Paid Launch

Do not charge until:

- sync is boringly reliable
- account recovery works
- billing is wired and tested
- support and analytics are ready
