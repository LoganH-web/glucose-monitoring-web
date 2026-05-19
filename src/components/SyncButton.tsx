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
        className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Sync now"}
      </button>
      {msg && <p className="mt-1 text-xs text-emerald-600">{msg}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
