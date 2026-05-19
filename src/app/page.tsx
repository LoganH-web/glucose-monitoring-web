import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Landing() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Glucose Monitor</h1>
      <p className="mt-3 text-slate-600">
        Connect your Eaglenos CGM, see your readings, and ask an AI assistant how
        you&apos;re doing and what to try next.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
