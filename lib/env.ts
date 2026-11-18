// NEXT_PUBLIC_* values must be read as literal `process.env.NEXT_PUBLIC_X` expressions:
// Next.js inlines them into browser bundles at build time, but only when written out
// literally. Dynamic access like `process.env[key]` is undefined in the browser.
function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  // Server-only; undefined in the browser by design.
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};
