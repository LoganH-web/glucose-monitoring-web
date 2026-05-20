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
      className="rounded-full border border-[#d6e5e1] bg-white/70 px-4 py-2 text-sm font-semibold text-[#17201d] transition hover:bg-white hover:text-[#286f52]"
    >
      Sign out
    </button>
  );
}
