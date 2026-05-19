"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddDeviceForm() {
  const router = useRouter();
  const [sn, setSn] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sn, label: label || undefined }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : "Failed to link device.");
      return;
    }
    router.push(`/dashboard/${encodeURIComponent(sn)}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-wrap gap-2">
      <input
        required
        placeholder="Device SN"
        value={sn}
        onChange={(e) => setSn(e.target.value.trim())}
        className="min-w-[180px] flex-1 rounded-md border border-slate-300 px-3 py-2"
      />
      <input
        placeholder="Label (optional)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="min-w-[160px] flex-1 rounded-md border border-slate-300 px-3 py-2"
      />
      <button
        type="submit"
        disabled={busy || !sn}
        className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Linking…" : "Link device"}
      </button>
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  );
}
