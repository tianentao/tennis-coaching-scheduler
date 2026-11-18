// npm run seed:demo  -> upsert demo accounts and replace demo slots/bookings
// npm run reset:demo -> also delete visitor-created player accounts (what the nightly cron does)
//
// Runs directly on Node 24 (type stripping); see the note at the top of lib/demo/seed.ts.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.ts";
import { DEMO_ACCOUNTS, resetDemo, seedDemo } from "../lib/demo/seed.ts";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}. Add it to .env.local (see .env.example).`);
    process.exit(1);
  }
  return value;
}

const supabase = createClient<Database>(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } }
);
const password = requireEnv("DEMO_ACCOUNT_PASSWORD");
const reset = process.argv.includes("--reset");

try {
  const result = reset ? await resetDemo(supabase, password) : await seedDemo(supabase, password);
  if ("deletedVisitors" in result) {
    console.log(`Deleted ${result.deletedVisitors} visitor account(s).`);
  }
  console.log(
    `Seeded ${result.slots} slots (${result.timeZone}, next ${result.days} days) and ${result.bookings} bookings.`
  );
  for (const account of Object.values(DEMO_ACCOUNTS)) {
    console.log(`  ${account.role.padEnd(6)} ${account.email} (${account.displayName})`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
