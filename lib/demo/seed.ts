// Demo data for the public demo, shared by:
//   - scripts/seed-demo.ts (npm run seed:demo / reset:demo)
//   - app/api/cron/reset-demo/route.ts (nightly Vercel Cron)
//   - app/login/actions.ts (one-click demo sign-in)
//
// This file is also run directly by Node (type stripping), so: relative imports with
// a .ts extension, `import type` for types, and no TS-only runtime syntax (enums etc.).

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database.ts";
import { APP_TIME_ZONE, nowInAppZone, parseAppZoneDateTimeLocal } from "../time.ts";

type AdminClient = SupabaseClient<Database>;
type SkillLevel = Database["public"]["Tables"]["time_slots"]["Row"]["skill_level"];
type Role = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export const DEMO_ACCOUNTS = {
  coach: { email: "demo-coach@example.com", displayName: "Maya Chen", role: "coach" },
  player: { email: "demo-player@example.com", displayName: "Alex Rivera", role: "player" },
  // Extra player so the coach's admin view shows more than one person's bookings.
  otherPlayer: { email: "demo-player-2@example.com", displayName: "Jordan Lee", role: "player" }
} as const satisfies Record<string, { email: string; displayName: string; role: Role }>;

const DEMO_EMAILS: ReadonlySet<string> = new Set(
  Object.values(DEMO_ACCOUNTS).map((account) => account.email)
);

const DAYS = 14;
const LOCATION = "Riverside Tennis Club";
const COURTS = ["Court 1", "Court 2", "Court 3", "Center Court"];

// [hour, minute, durationMinutes, skillLevel] in APP_TIME_ZONE
type Session = [number, number, number, SkillLevel];
const WEEKDAY_SESSIONS: Session[] = [
  [7, 0, 60, "advanced"],
  [9, 30, 60, "beginner"],
  [16, 0, 60, "intermediate"],
  [17, 30, 90, "all_levels"],
  [19, 0, 60, "advanced"]
];
const WEEKEND_SESSIONS: Session[] = [
  [8, 0, 60, "beginner"],
  [9, 30, 90, "intermediate"],
  [11, 0, 60, "all_levels"],
  [14, 0, 60, "advanced"]
];

// Supabase results are `{ data, error: null } | { data: null, error }`; return the
// success branch's data, typed as non-null.
function check<R extends { data: unknown; error: { message: string } | null }>(
  result: R,
  what: string
): Extract<R, { error: null }>["data"] {
  if (result.error) {
    throw new Error(`${what}: ${result.error.message}`);
  }
  return result.data;
}

const pad = (value: number) => String(value).padStart(2, "0");

async function listAllUsers(supabase: AdminClient) {
  const users = [];
  for (let page = 1; ; page++) {
    const { users: batch } = check(
      await supabase.auth.admin.listUsers({ page, perPage: 1000 }),
      "list users"
    );
    users.push(...batch);
    if (batch.length < 1000) {
      return users;
    }
  }
}

export async function findUserIdByEmail(supabase: AdminClient, email: string) {
  return (await listAllUsers(supabase)).find((user) => user.email === email)?.id;
}

async function upsertAccount(
  supabase: AdminClient,
  account: (typeof DEMO_ACCOUNTS)[keyof typeof DEMO_ACCOUNTS],
  existingId: string | undefined,
  password: string
) {
  const attributes = {
    password,
    email_confirm: true,
    user_metadata: { display_name: account.displayName }
  };
  const { user } = existingId
    ? check(await supabase.auth.admin.updateUserById(existingId, attributes), `update ${account.email}`)
    : check(
        await supabase.auth.admin.createUser({ email: account.email, ...attributes }),
        `create ${account.email}`
      );

  check(
    await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: account.displayName, role: account.role }),
    `profile for ${account.email}`
  );
  return user.id;
}

function buildSlots(coachId: string) {
  const today = nowInAppZone();
  const now = Date.now();
  const slots: Database["public"]["Tables"]["time_slots"]["Insert"][] = [];

  for (let offset = 0; offset < DAYS; offset++) {
    // Noon UTC keeps the calendar date stable while stepping through days.
    const date = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + offset, 12));
    const ymd = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    const weekday = date.getUTCDay();
    const sessions = weekday === 0 || weekday === 6 ? WEEKEND_SESSIONS : WEEKDAY_SESSIONS;

    sessions.forEach(([hour, minute, duration, skillLevel], index) => {
      const startsAt = parseAppZoneDateTimeLocal(`${ymd}T${pad(hour)}:${pad(minute)}`);
      if (startsAt.getTime() <= now) {
        return;
      }
      slots.push({
        coach_id: coachId,
        starts_at: startsAt.toISOString(),
        ends_at: new Date(startsAt.getTime() + duration * 60_000).toISOString(),
        location: LOCATION,
        court_name: COURTS[(offset + index) % COURTS.length],
        skill_level: skillLevel,
        is_active: true
      });
    });
  }
  return slots;
}

// Upserts the demo accounts (resetting passwords and names), replaces every slot owned
// by the demo coach (and all bookings on them) with fresh ones starting today, and adds
// a few sample bookings. Accounts other than the demo accounts are left alone.
export async function seedDemo(supabase: AdminClient, password: string) {
  const users = await listAllUsers(supabase);
  const idFor = (email: string) => users.find((user) => user.email === email)?.id;

  const coachId = await upsertAccount(supabase, DEMO_ACCOUNTS.coach, idFor(DEMO_ACCOUNTS.coach.email), password);
  const playerId = await upsertAccount(supabase, DEMO_ACCOUNTS.player, idFor(DEMO_ACCOUNTS.player.email), password);
  const otherPlayerId = await upsertAccount(
    supabase,
    DEMO_ACCOUNTS.otherPlayer,
    idFor(DEMO_ACCOUNTS.otherPlayer.email),
    password
  );

  const oldSlotIds = check(
    await supabase.from("time_slots").select("id").eq("coach_id", coachId),
    "list old slots"
  ).map((slot) => slot.id);

  // Insert the new slots before deleting the old ones, so a failure here (this runs
  // unattended every night) leaves yesterday's demo in place instead of an empty one.
  const slots = check(
    await supabase
      .from("time_slots")
      .insert(buildSlots(coachId))
      .select("id, starts_at")
      .order("starts_at"),
    "insert slots"
  );

  // Bookings first: bookings.slot_id is ON DELETE RESTRICT.
  if (oldSlotIds.length > 0) {
    check(await supabase.from("bookings").delete().in("slot_id", oldSlotIds), "delete old bookings");
    check(await supabase.from("time_slots").delete().in("id", oldSlotIds), "delete old slots");
  }

  // Every row lists every column: in a multi-row insert, PostgREST sends null (not the
  // column default) for keys missing from some rows.
  const pick = (fraction: number) => slots[Math.floor(slots.length * fraction)].id;
  const booked = { status: "booked", cancelled_at: null } as const;
  const bookings: Database["public"]["Tables"]["bookings"]["Insert"][] = [
    { slot_id: pick(0.1), user_id: playerId, notes: "Working on my second serve.", ...booked },
    { slot_id: pick(0.45), user_id: playerId, notes: null, ...booked },
    { slot_id: pick(0.3), user_id: otherPlayerId, notes: "Backhand footwork, please.", ...booked },
    { slot_id: pick(0.7), user_id: otherPlayerId, notes: null, ...booked },
    // Cancelled booking: kept as history and doesn't block the slot.
    {
      slot_id: pick(0.2),
      user_id: playerId,
      notes: "Can't make it this week.",
      status: "cancelled",
      cancelled_at: new Date().toISOString()
    }
  ];
  check(await supabase.from("bookings").insert(bookings), "insert bookings");

  return { slots: slots.length, bookings: bookings.length, timeZone: APP_TIME_ZONE, days: DAYS };
}

// Deletes accounts visitors signed up for: every user whose profile role is "player",
// except the demo accounts. Their bookings and profiles cascade. Coach and admin
// accounts are never deleted, so your own admin account survives the reset.
export async function deleteVisitorAccounts(supabase: AdminClient) {
  const users = await listAllUsers(supabase);
  const roles = new Map(
    check(await supabase.from("profiles").select("id, role"), "list profiles").map((profile) => [
      profile.id,
      profile.role
    ])
  );

  const visitors = users.filter(
    (user) => !DEMO_EMAILS.has(user.email ?? "") && (roles.get(user.id) ?? "player") === "player"
  );
  for (const user of visitors) {
    check(await supabase.auth.admin.deleteUser(user.id), `delete visitor ${user.email}`);
  }
  return visitors.length;
}

// Nightly reset: remove visitor accounts, then re-seed.
export async function resetDemo(supabase: AdminClient, password: string) {
  const deletedVisitors = await deleteVisitorAccounts(supabase);
  return { deletedVisitors, ...(await seedDemo(supabase, password)) };
}
