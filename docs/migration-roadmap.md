# Migration Roadmap

This project now has two lanes:

- `index.html` and `assets/` remain the prototype lane for visual reference and fast interaction testing.
- `src/` is the real application lane for production-ready architecture.

## Immediate Goal

Stand up a real web application shell that can grow into:

- authenticated accounts
- API-backed journal entries
- persistent collections
- subscriptions and premium features

## Recommended Next Steps

1. Install app dependencies and run the Next.js scaffold locally.
2. Add a persistent app shell with route groups for `journal`, `collection`, and `settings`.
3. Port the journal home screen into reusable React components.
4. Introduce a typed server boundary for entries and collections.
5. Add auth and billing once the journal flows are moved off local storage.
