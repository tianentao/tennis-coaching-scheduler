import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { DemoLogin } from "@/components/demo-login";
import { getOptionalUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/calendar");
  }

  const demoEnabled = Boolean(process.env.DEMO_ACCOUNT_PASSWORD);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-6xl items-center px-6 py-16">
      <div className="grid w-full gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-court-200">
            Auth + Profiles
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Secure player and coach access through Supabase Auth.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Profiles are created automatically from `auth.users`, and access is enforced with
            PostgreSQL Row Level Security policies.
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 lg:items-end">
          {demoEnabled ? <DemoLogin /> : null}
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
