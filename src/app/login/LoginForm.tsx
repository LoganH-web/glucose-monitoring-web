"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="rounded-[2.25rem] border border-[#d8e8e4] bg-white/55 p-6 shadow-[0_28px_100px_rgba(27,78,66,0.12)] backdrop-blur">
      <div className="rounded-[1.75rem] bg-white/70 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68736f]">
              Secure sign in
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[#161b19]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#68736f]">
              Access your devices, latest glucose readings, and AI
              summaries from one dashboard.
            </p>
          </div>
          <span className="rounded-full bg-[#e4f1ee] px-4 py-2 text-xs font-bold text-[#286f52]">
            Live
          </span>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#3f4b47]">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#d6e5e1] bg-[#f7fbfa] px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-[#286f52] focus:bg-white focus:ring-4 focus:ring-[#286f52]/10"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#3f4b47]">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#d6e5e1] bg-[#f7fbfa] px-5 py-4 text-base outline-none transition placeholder:text-slate-400 focus:border-[#286f52] focus:bg-white focus:ring-4 focus:ring-[#286f52]/10"
              placeholder="Enter your password"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-[#286f52] px-6 py-4 text-base font-bold text-white shadow-[0_18px_45px_rgba(40,111,82,0.24)] transition hover:bg-[#225f47] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#68736f]">
          No account?{" "}
          <Link href="/signup" className="font-bold text-[#286f52] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
