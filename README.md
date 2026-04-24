# The Finder's Log

The Finder's Log is now split into two tracks: a static prototype for visual reference, and a real application scaffold for production work.

## Prototype Lane

- Prototype UI runs from [index.html](/Users/bobby.burdette/Pipe%20Journal/index.html)
- Styling lives in [assets/css/app.css](/Users/bobby.burdette/Pipe%20Journal/assets/css/app.css)
- Browser-side logic lives in [assets/js/app](/Users/bobby.burdette/Pipe%20Journal/assets/js/app)
- Platform boundaries live in:
  - [assets/js/platform/config.global.js](/Users/bobby.burdette/Pipe%20Journal/assets/js/platform/config.global.js)
  - [assets/js/platform/storage.global.js](/Users/bobby.burdette/Pipe%20Journal/assets/js/platform/storage.global.js)

## Real App Lane

- Next.js app entry lives in [src/app/page.tsx](/Users/bobby.burdette/Pipe%20Journal/src/app/page.tsx)
- Global app layout lives in [src/app/layout.tsx](/Users/bobby.burdette/Pipe%20Journal/src/app/layout.tsx)
- Shared styling lives in [src/app/globals.css](/Users/bobby.burdette/Pipe%20Journal/src/app/globals.css)
- Shared app/domain configuration lives in:
  - [src/lib/app-config.ts](/Users/bobby.burdette/Pipe%20Journal/src/lib/app-config.ts)
  - [src/lib/domain.ts](/Users/bobby.burdette/Pipe%20Journal/src/lib/domain.ts)
- First branded shell component lives in [src/components/home/home-shell.tsx](/Users/bobby.burdette/Pipe%20Journal/src/components/home/home-shell.tsx)

## Planning Docs

- Architecture blueprint: [docs/prime-time-architecture.md](/Users/bobby.burdette/Pipe%20Journal/docs/prime-time-architecture.md)
- API contract draft: [docs/api-contract.md](/Users/bobby.burdette/Pipe%20Journal/docs/api-contract.md)
- Migration roadmap: [docs/migration-roadmap.md](/Users/bobby.burdette/Pipe%20Journal/docs/migration-roadmap.md)
- Database schema draft: [db/schema.sql](/Users/bobby.burdette/Pipe%20Journal/db/schema.sql)
- Environment template: [.env.example](/Users/bobby.burdette/Pipe%20Journal/.env.example)

## Next Step

Install dependencies and run the Next.js app, then start porting journal and collection flows from the prototype into reusable React components and server-backed APIs.
