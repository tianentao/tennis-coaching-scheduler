"use server";

import { redirect } from "next/navigation";
import { DEMO_ACCOUNTS, findUserIdByEmail } from "@/lib/demo/seed";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEMO_LOGINS = {
  player: { email: DEMO_ACCOUNTS.player.email, landing: "/calendar" },
  coach: { email: DEMO_ACCOUNTS.coach.email, landing: "/admin" }
} as const;

export type DemoRole = keyof typeof DEMO_LOGINS;
export type DemoSignInState = { error: string | null };

function isDemoRole(value: FormDataEntryValue | null): value is DemoRole {
  return value === "player" || value === "coach";
}

// The demo accounts are shared, so a visitor could change a demo password from the
// browser. If sign-in fails, put the password back and try once more.
async function restoreDemoPassword(email: string, password: string) {
  const admin = createSupabaseAdminClient();
  const userId = await findUserIdByEmail(admin, email).catch(() => undefined);
  if (!userId) {
    return false;
  }
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  return !error;
}

export async function demoSignIn(
  _previous: DemoSignInState,
  formData: FormData
): Promise<DemoSignInState> {
  const role = formData.get("role");
  const password = process.env.DEMO_ACCOUNT_PASSWORD;

  if (!isDemoRole(role) || !password) {
    return { error: "The demo isn't available right now." };
  }

  const { email, landing } = DEMO_LOGINS[role];
  const supabase = await createSupabaseServerClient();
  let { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error?.code === "invalid_credentials" && (await restoreDemoPassword(email, password))) {
    ({ error } = await supabase.auth.signInWithPassword({ email, password }));
  }

  if (error) {
    console.error(`Demo sign-in as ${role} failed:`, error.message);
    return { error: "Couldn't start the demo. Please try again in a minute." };
  }

  redirect(landing);
}
