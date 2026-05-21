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
    <div className="min-h-screen bg-[#eef8f6] text-[#17201d]">
      <header className="px-6 pt-7 sm:px-10 lg:px-14">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-4 rounded-full border border-white/80 bg-white/80 px-6 py-3 text-xl font-semibold shadow-[0_18px_50px_rgba(27,78,66,0.08)] backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center">
              <span className="block h-0 w-0 border-x-[8px] border-b-[24px] border-x-transparent border-b-[#286f52]" />
            </span>
            AI Wellness
          </Link>

          <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-[#68736f] shadow-sm backdrop-blur">
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
