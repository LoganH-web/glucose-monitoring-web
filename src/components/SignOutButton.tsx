"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function onClick() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-700"
    >
      Sign out
    </button>
  );
}
