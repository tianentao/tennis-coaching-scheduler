# Tennis Coaching Scheduler

Production-quality starter for a tennis coaching scheduling platform built with Next.js App Router, React, TypeScript, Tailwind CSS, and Supabase.

## Step 1: High-level architecture

### Frontend

- `app/` contains App Router pages for login, weekly calendar, dashboard, and API route handlers.
- `components/` holds reusable UI blocks such as the auth form, weekly calendar, booking CTA, and booking list.
- Server-rendered pages fetch data through typed Supabase helpers in `lib/`, while client components handle interactive auth and booking actions.

### Backend

- Supabase Auth manages users. A `profiles` table stores app metadata like `display_name` and role.
- `time_slots` stores coach-defined availability.
- `bookings` stores reservations with status history (`booked`, `cancelled`).
- Transaction-safe booking and cancellation are handled in PostgreSQL functions:
  - `book_time_slot(...)` locks the target row with `FOR UPDATE`, checks availability, and inserts the booking.
  - `cancel_booking(...)` changes the booking status to `cancelled` for the owner or an admin.

### Security

- Row Level Security scopes bookings to the logged-in user by default.
- `profiles.role` determines elevated coach/admin privileges.
- The `available_time_slots` view only exposes active, unbooked sessions.
- `/admin` gives coach/admin users a basic operational surface for creating slots and reviewing all bookings.

## Step 2: Full database schema (SQL)

The full schema lives in [supabase/migrations/20260326170000_initial_schema.sql](/Users/tim/Documents/Playground/supabase/migrations/20260326170000_initial_schema.sql).

Key design decisions:

- Double booking is prevented in two layers:
  - A partial unique index on `bookings(slot_id)` where `status = 'booked'`
  - The `book_time_slot` function locks the slot row and checks for active bookings before insert
- Cancelled bookings remain in history, but they no longer block the slot from being booked again.
- `profiles` are auto-created from `auth.users` via trigger.

## Step 3: Backend API implementation

Route handlers:

- `GET /api/slots`
  - File: [app/api/slots/route.ts](/Users/tim/Documents/Playground/app/api/slots/route.ts)
  - Returns available slots, optionally filtered by `startsAt` and `endsAt`
- `POST /api/book`
  - File: [app/api/book/route.ts](/Users/tim/Documents/Playground/app/api/book/route.ts)
  - Requires auth and calls `book_time_slot(...)`
- `DELETE /api/booking?id=<bookingId>`
  - File: [app/api/booking/route.ts](/Users/tim/Documents/Playground/app/api/booking/route.ts)
  - Requires auth and calls `cancel_booking(...)`

Implementation notes:

- Auth is verified server-side through the Supabase SSR client.
- Validation uses `zod`.
- Booking race conditions are handled in PostgreSQL, which is the safest place to enforce consistency.

## Step 4: Frontend skeleton

Pages:

- [app/login/page.tsx](/Users/tim/Documents/Playground/app/login/page.tsx)
- [app/calendar/page.tsx](/Users/tim/Documents/Playground/app/calendar/page.tsx)
- [app/dashboard/page.tsx](/Users/tim/Documents/Playground/app/dashboard/page.tsx)
- [app/admin/page.tsx](/Users/tim/Documents/Playground/app/admin/page.tsx)

Reusable components:

- [components/auth-form.tsx](/Users/tim/Documents/Playground/components/auth-form.tsx)
- [components/weekly-calendar.tsx](/Users/tim/Documents/Playground/components/weekly-calendar.tsx)
- [components/booking-button.tsx](/Users/tim/Documents/Playground/components/booking-button.tsx)
- [components/booking-list.tsx](/Users/tim/Documents/Playground/components/booking-list.tsx)
- [components/cancel-booking-button.tsx](/Users/tim/Documents/Playground/components/cancel-booking-button.tsx)
- [components/admin-slot-form.tsx](/Users/tim/Documents/Playground/components/admin-slot-form.tsx)
- [components/admin-bookings-table.tsx](/Users/tim/Documents/Playground/components/admin-bookings-table.tsx)

Current UX flow:

1. Users sign up or sign in on `/login`
2. Users browse open slots on `/calendar`
3. Users book via `/api/book`
4. Users manage their bookings on `/dashboard`
5. Coaches/admins create slots and review all bookings on `/admin`

## Step 5: Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

3. Add your Supabase project values to `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Apply the SQL migration in Supabase:

- Open the Supabase SQL Editor and run the contents of [supabase/migrations/20260326170000_initial_schema.sql](/Users/tim/Documents/Playground/supabase/migrations/20260326170000_initial_schema.sql)
- Or use the Supabase CLI migration workflow if you already have it configured

5. Seed at least one coach/admin user:

- Create a user through Supabase Auth
- Update that user’s profile role:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

6. Start the app:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

## Suggested next production steps

- Add automated reminder jobs using Vercel Cron or Supabase scheduled functions
- Add tests for the booking RPCs and API handlers
- Add availability conflict checks if a coach should not create overlapping slots
