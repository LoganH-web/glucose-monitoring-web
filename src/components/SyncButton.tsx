"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SyncButton({ sn }: { sn: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setBusy(true);
    setError(null);
    setMsg(null);
    const res = await fetch(`/api/devices/${encodeURIComponent(sn)}/sync`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : "Sync failed.");
      return;
    }
    const j = await res.json();
    setMsg(`Pulled ${j.inserted} new readings.`);
    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        onClick={onClick}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-6 py-4 text-base font-bold text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={busy ? "animate-spin" : ""}
          aria-hidden="true"
        >
          <path
            d="M14 8A6 6 0 1 1 8 2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="M8 2L11 5M8 2L5 5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        {busy ? "Syncing..." : "Sync new data"}
      </button>
      {msg && <p className="mt-2 text-xs font-semibold text-blue-700">{msg}</p>}
      {error && <p className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}
