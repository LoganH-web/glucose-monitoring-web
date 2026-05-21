import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="px-6 pt-7 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-4 rounded-full border border-blue-100 bg-white px-6 py-3 text-xl font-semibold shadow-[0_18px_50px_rgba(37,99,235,0.08)] backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <span className="block h-0 w-0 border-x-[8px] border-b-[24px] border-x-transparent border-b-blue-700" />
            </span>
            AI Wellness
          </Link>

          <div className="flex items-center gap-3 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm backdrop-blur">
            <span className="hidden max-w-[220px] truncate sm:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-10 lg:px-14">
        {children}
      </main>
    </div>
  );
}
