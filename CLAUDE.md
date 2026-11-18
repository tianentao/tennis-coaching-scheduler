# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Next.js dev server on http://localhost:3000
npm run build      # production build
npm run lint       # next lint (eslint-config-next core-web-vitals)
npm run typecheck  # tsc --noEmit
npm run seed:demo  # (re)seed demo accounts, 14 days of slots, sample bookings
npm run reset:demo # same, plus delete visitor-created player accounts (what the nightly cron does)
npm run test:e2e -- <url>    # headless-Chrome click-through of player + coach flows (default localhost:3000); re-seed after
npm run screenshots -- <url> # desktop + phone screenshots into docs/screenshots/
```

There are no unit tests; `test:e2e` is the only automated check, and it is the one that catches browser-only bugs (curl-based checks never run client JS). Run it against the live URL after deploying. Requires `.env.local` (copy `.env.example`) with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `lib/env.ts` throws at import time if either is missing. Read `NEXT_PUBLIC_*` vars only as literal `process.env.NEXT_PUBLIC_X`; dynamic `process.env[key]` is undefined in the browser and crashes every client component that imports `lib/env.ts`. `SUPABASE_SERVICE_ROLE_KEY` is only needed by `lib/supabase/admin.ts`.

The hosted Supabase project (ref `acuyehdoteiurwrdgeec`, us-west-1) is linked via the Supabase CLI, installed as a dev dependency (`npx supabase`, not Homebrew). `.env.local` holds the URL, publishable key (as `NEXT_PUBLIC_SUPABASE_ANON_KEY`), secret key (as `SUPABASE_SERVICE_ROLE_KEY`) and `SUPABASE_DB_PASSWORD`.

```bash
set -a; . ./.env.local; set +a          # CLI reads SUPABASE_DB_PASSWORD
npx supabase db push --remote --dry-run  # then without --dry-run, plus --yes, to apply migrations
npx supabase config diff                 # always diff before `config push`
```

`config push` sends every declared setting in `supabase/config.toml`, not just the one you edited. The file has been aligned with the hosted project's values so the only intentional difference is `auth.email.enable_confirmations = false` (demo visitors sign up without email verification). Keep it aligned. `projects api-keys` masks secret keys unless you pass `--reveal`.

### Demo data and nightly reset

`lib/demo/seed.ts` is the single source for the demo: `DEMO_ACCOUNTS` (`demo-coach@example.com`, `demo-player@example.com`, `demo-player-2@example.com`, all using `DEMO_ACCOUNT_PASSWORD`), `seedDemo()` and `resetDemo()`. It's used by `scripts/seed-demo.ts`, the demo login action, and `GET /api/cron/reset-demo`, which Vercel Cron calls daily at 11:00 UTC (`vercel.json`) with `Authorization: Bearer $CRON_SECRET`. The route returns 401 if `CRON_SECRET` is unset.

- `seedDemo()` is idempotent: upserts the demo accounts (resetting password and name), inserts fresh slots from today, then deletes the demo coach's old slots and their bookings. New rows are inserted before old ones are deleted, so a failure never leaves the demo empty.
- `resetDemo()` first deletes every non-demo user whose role is `player`. Coach/admin accounts are never deleted.
- `scripts/seed-demo.ts` runs on plain Node 24 (type stripping), so it and everything it imports (`lib/demo/seed.ts`, `lib/time.ts`, `types/database.ts`) must use relative imports with a `.ts` extension (`allowImportingTsExtensions` is on), `import type` for types, and no enums or other TS-only runtime syntax. Never use the `@/` alias in those files. The package is `"type": "module"`.
- Multi-row inserts must list every column on every row (PostgREST sends null, not the default, for missing keys). With `.insert().select()`, any `.order()` column must be in the select.

Admin/coach users are created by setting `profiles.role` to `'admin'` or `'coach'` in SQL.

## Deployment

Production is the Vercel project `tennis-coaching-scheduler` (Hobby plan), live at https://tennis-coaching-scheduler.vercel.app. The folder is linked via `.vercel/` and deployed from the CLI, not from git: `npx vercel deploy --prod`. `vercel.json` must keep `"framework": "nextjs"` (the project was created from the CLI with no preset) and holds the cron schedule.

Production env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEMO_ACCOUNT_PASSWORD`, `CRON_SECRET` (manage with `npx vercel env`). `SUPABASE_DB_PASSWORD` is for the local CLI only. Supabase `auth.site_url` in `supabase/config.toml` points at the production URL; `http://localhost:3000/**` is an allowed redirect.

Known accepted audit finding: `postcss` bundled inside Next 15 (build-time only, needs attacker-controlled CSS; the fix is Next 16).

## Architecture

Tennis coaching scheduler: Next.js 15 App Router + React 19 + TypeScript (strict) + Tailwind + Supabase (Auth + Postgres). Path alias `@/*` maps to the repo root. `experimental.typedRoutes` is on, so `href`/`redirect` targets must be real routes.

### Business rules live in Postgres, not in TypeScript

The migration (`supabase/migrations/20260326170000_initial_schema.sql`) is the source of truth for correctness and authorization:

- **Booking/cancellation go through RPCs** — `book_time_slot(target_slot_id, booking_notes)` locks the slot row `FOR UPDATE` and checks availability; `cancel_booking(target_booking_id)` sets status to `cancelled` (owner or admin). API routes call these via `supabase.rpc(...)` rather than writing to `bookings` directly.
- **Double-booking protection** is also enforced by a partial unique index on `bookings(slot_id) WHERE status = 'booked'`. Cancelled bookings stay as history and free the slot.
- **`available_time_slots` view** (`security_invoker = true`) returns active slots with no active booking, joined with coach `display_name`. Read slots from this view, not `time_slots`. Because it runs under the viewer's RLS, anything it reads must be visible to players: the booked check goes through the security definer `slot_has_active_booking()`, and the `profiles_select_coaches` policy makes coach/admin profiles readable. Dropping either makes slots silently disappear or show as open when they're booked.
- **`is_admin()`** (security definer) returns true for role `coach` **or** `admin`. Both `requireAdmin()` and the admin API route use it.
- **RLS** scopes `bookings` to the owner (or admin); `time_slots` are readable by any authenticated user and writable only by admins. `profiles` rows are auto-created from `auth.users` via the `handle_new_user` trigger.

When changing schema, add a new migration file and update `types/database.ts` (hand-maintained `Database` type, Supabase-generated shape) to match.

### Supabase clients (`lib/supabase/`)

- `server.ts` — `createSupabaseServerClient()` for Server Components and route handlers; uses `next/headers` cookies (async). Runs as the user, so RLS applies.
- `client.ts` — browser client for `"use client"` components (auth form, etc.).
- `admin.ts` — service-role client that bypasses RLS; server-only.
- `middleware.ts` (root) refreshes the auth session cookie on every request via `supabase.auth.getUser()`. It does not enforce route protection.

### Auth & data access

- Page-level protection is done in Server Components with `lib/auth.ts`: `requireUser()` (redirects to `/login`), `requireAdmin()` (redirects to `/calendar`), `getOptionalUser()`.
- One-click demo login: `components/demo-login.tsx` posts only a role to the `demoSignIn` server action (`app/login/actions.ts`), which signs in server-side with `DEMO_ACCOUNT_PASSWORD` and redirects (player → `/calendar`, coach → `/admin`). The password never reaches the browser. On `invalid_credentials` it resets the shared account's password with the admin client and retries once, since visitors can change it. The card only renders when `DEMO_ACCOUNT_PASSWORD` is set. Demo emails come from `DEMO_ACCOUNTS` in `lib/demo/seed.ts`.
- Server-side reads are centralized in `lib/bookings.ts` (`getAvailableSlots`, `getMyBookings`, `getAllBookings`). Note `getMyBookings` relies on RLS to restrict to the current user rather than filtering by `user_id`.
- App-level types (`AvailableSlot`, `BookingRecord`, `AdminBookingRecord`, `JsonResponse<T>`) are in `types/app.ts`.

### API route handlers (`app/api/`)

Pattern: create server client → `auth.getUser()` (401 if absent) → optional `rpc("is_admin")` (403) → validate body with `zod` (400) → call RPC/query → respond with `NextResponse.json<JsonResponse<T>>({ data } | { error })`.

- `GET /api/slots` — available slots, optional `startsAt`/`endsAt` filters
- `POST /api/book` — calls `book_time_slot`
- `DELETE /api/booking?id=<bookingId>` — calls `cancel_booking`
- `POST /api/admin/slots` — admin-only slot creation
- `GET /api/auth/callback` — Supabase auth code exchange

### Time zone

All date math and display use `APP_TIME_ZONE` (America/Los_Angeles) from `lib/time.ts`, never the server zone (UTC on Vercel) or the browser zone. Use `formatInAppZone()` instead of `format()`, pass `{ in: inAppZone }` to date-fns v4 functions like `startOfWeek`/`isSameDay`, and convert `datetime-local` input with `parseAppZoneDateTimeLocal()` instead of `new Date(value)`. Don't send a `TZDate` to the API: its `toISOString()` has a `-08:00` offset, which `z.iso.datetime()` rejects (the helper returns a plain `Date` for this reason). The demo seed uses the same helpers. `/calendar?week=N` (0–12) picks the week; it hides slots that have already started.

Pages: `/login`, `/calendar` (browse/book), `/dashboard` (my bookings), `/admin` (create slots, all bookings). Interactive pieces (booking/cancel buttons, auth form, admin slot form) are client components in `components/` that call the API routes. Tailwind uses a custom `court` color palette (see `tailwind.config.ts`); `cn()` in `lib/utils.ts` merges class names.
