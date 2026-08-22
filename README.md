# QuincaDZ

QuincaDZ is a mobile-first Algerian marketplace for hardware, tools, and construction supplies. It connects customers with local stores, supports delivery by wilaya, and is designed around cash-on-delivery workflows.

## Product surface

The repository contains three role-based experiences: a customer marketplace for browsing products, managing a cart, and placing orders; a store workspace for managing catalog items and orders; and an admin workspace for platform-level management of stores, users, categories, products, and settings. Supabase provides authentication, persistence, and storage through the existing browser and server clients.

## Architecture overview

The application is a Next.js App Router project with a shared root layout and separate route groups for `client`, `store`, `admin`, and `auth`. Shared UI and state live under `src/components`, `src/contexts`, and `src/lib`. Browser-side Supabase access is used for interactive screens; server-side Supabase access is used for server-rendered redirects and data reads. Middleware refreshes sessions and applies role-based path guards.

The current architecture is intentionally modular at the UI level, but the business layer is still thin: several components write directly to Supabase, and the order workflow spans multiple client-side inserts. The next structural milestone is to introduce typed repositories or server actions for orders, inventory, and merchant operations.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- A Supabase project with the application tables, Row Level Security policies, storage bucket, and `decrement_stock` RPC used by the product flows

## Installation

```bash
npm ci
```

Create `.env.local` at the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SENTRY_AUTH_TOKEN=optional-sentry-token
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for authenticated and data-backed routes. The public root page can render without them for local visual preview, but protected flows cannot function without a valid Supabase project.

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The anonymous root route is the public entry page. Authenticated users are redirected to the workspace matching their profile role.

## Production build

```bash
npm run build
npm run start
```

The production build currently passes TypeScript and Next.js compilation. The lint command remains useful as a debt register, but it currently reports legacy issues across admin, store, location, and localization files; see the audit report for the recommended cleanup order.

## Quality checks

```bash
npm run lint
npm run build
```

The repository includes Playwright configuration, but it does not yet contain a complete end-to-end test suite. The first critical tests should cover anonymous landing-page rendering, authentication redirects, cart persistence, checkout persistence of `orders` and `order_items`, stock decrement behavior, and role isolation.

## Data and transaction notes

Orders are currently created per store from the client checkout screen. The revised flow captures the inserted order UUID, persists its order items, attempts stock decrements, and deletes newly-created orders if a later step fails. This is a safer compatibility patch, not a replacement for a database transaction. The production target should move the complete multi-store checkout into a versioned server-side function or Supabase RPC with idempotency keys, stock validation, and an atomic outbox or order-event record.

## Repository conventions

Use semantic HTML, typed domain models, explicit loading and error states, accessible focus indicators, and mobile-first CSS. Keep external calls behind a clear boundary as the application grows. Do not commit `.env.local`, service-role keys, generated build output, or customer data.

## License

No license file is currently included. Add an explicit license before accepting external contributions or distributing the project publicly.
