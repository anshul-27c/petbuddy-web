# petbuddy-web

The pet-owner website for PetBuddy: find a vetted carer, book and pay for a
visit, follow it live, chat with the carer, and shop the pet store. Carers
use the PetBuddy app; the website only explains how to join.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
TanStack Query v5 and lucide-react. Everything that touches data renders in
the browser: pages are client components that call the PetBuddy API through
one typed client (`src/lib/api.ts`). There are no server actions, route
handlers or middleware.

## Requirements

- Node 24 and npm
- The PetBuddy API running (see `petbuddy-backend`), by default on
  `http://localhost:3333`

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3333` | Base URL of the API, without `/api/v1` |

Copy `.env.example` to `.env.local` and change the value if the API runs
elsewhere. The value is read at build time, so rebuild after changing it.

## Running

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start          # serves on port 3000
```

Checks:

```bash
npm run lint
```

Deploying to Railway: `railway.json` builds with `npm run build` and starts
`next start` on the port Railway assigns. Set one variable on the service,
`NEXT_PUBLIC_API_URL=https://${{petbuddy-backend.RAILWAY_PUBLIC_DOMAIN}}`
(the API service's name inside `${{…}}`), and add this service's domain to
the API's `CORS_ORIGIN`. The value is baked in at build time, so redeploy
after changing it.

## Page map

Public:

| Path | What it shows |
|---|---|
| `/` | Hero, services with starting prices, how it works, trust and safety, carers near you, store teaser, carer sign-up band |
| `/carers` | Search, filter chips, service picker, sort and favourites-only (signed in); filters live in the URL |
| `/carers/[id]` | Carer profile: trust signals, about, services and prices, 14-day availability, reviews with a paginated "all reviews" dialog, sticky Book button |
| `/store` | Products with category chips and search, basket controls, basket drawer |
| `/become-a-carer` | How carers join in the app: verification, starter kit, payouts |
| `/login` | Phone number, then a six-digit code; returns to `?next=` |

Signed in (a visitor who is signed out is sent to `/login?next=…`):

| Path | What it shows |
|---|---|
| `/book/[earnerId]` | Four steps (service, pet, when, where) with inline "add a pet" and "add an address", then the full price breakdown and payment. Accepts `?service=` and `?start=` |
| `/bookings` | Upcoming (soonest pinned) and past (`?tab=past`) |
| `/bookings/[id]` | Status and next steps, live panel with map and SOS while the carer is on the way or with your pet, carer contact, timeline, price, cancel, reschedule and rate. `?confirmed=1` shows the success banner |
| `/messages`, `/messages/[id]` | Conversations and a thread (refreshed every few seconds) |
| `/store/checkout` | Delivery address, order summary, payment |
| `/orders`, `/orders/[id]` | Store orders and their progress |
| `/account` | Profile, sign out, delete account |
| `/account/pets`, `/account/addresses`, `/account/favourites` | Manage pets, addresses and saved carers |

## How it is put together

```
src/
  app/                  routes (all data pages are client components)
  components/
    ui/                 buttons, fields, dialog, popover, pills, skeletons, states
    layout/             header, footer, menus, page title
    auth/               token-backed auth provider, route guard, OTP boxes
    booking/            booking flow, detail panels, dialogs, live map
    carers/ store/ chat/ pets/ addresses/ home/ account/ payments/
  lib/
    api.ts              the one API client, typed per endpoint
    types.ts            shapes copied from the API contract
    format.ts           money (paise), dates and times (en-IN), distances
    labels.ts           sentence-case labels for every enum
    queries.ts          shared queries (config, services, pets, addresses, cart)
    query-keys.ts       TanStack Query keys, grouped for invalidation
    payments/           cancellation error and the hosted checkout module
```

- **Auth**: the bearer token is kept in `localStorage`. Any `401` clears it
  and sends the person to sign in. Pages read the token after mount, so the
  first render is a neutral skeleton rather than a hydration mismatch.
- **Money** is integer paise throughout and formatted in one place
  (`formatMoney`: `₹1,20,000`, `₹12.50`). Prices always come from the API.
- **Payments** go through one `pay()` function (`usePay()`), chosen by
  `GET /config`:
  - `mock` opens a "Test payment" dialog; nothing is charged.
  - `razorpay` creates a provider order and opens the hosted checkout
    (`src/lib/payments/razorpay.ts`). This path has not been run against a
    live key yet.
  Closing either without paying is treated as "cancelled" and changes nothing.
- **Design tokens** (colours, radii, type sizes, the floating shadow) are
  Tailwind v4 `@theme` tokens in `src/app/globals.css`; the default palette is
  cleared so only these colours exist.
