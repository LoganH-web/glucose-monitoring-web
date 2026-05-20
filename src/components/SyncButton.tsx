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
        className="flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={busy ? "animate-spin" : ""}
        >
          <path
            d="M12.25 7A5.25 5.25 0 1 1 7 1.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7 1.75L9.625 4.375M7 1.75L4.375 4.375"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {busy ? "Syncing…" : "Sync new data"}
      </button>
      {msg && <p className="mt-1 text-xs text-brand-500">{msg}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
