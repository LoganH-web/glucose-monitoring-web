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
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
      <label className="block">
        <span className="text-sm font-semibold text-[#3f4b47]">Device SN</span>
        <input
          required
          placeholder="D115W65000875"
          value={sn}
          onChange={(e) => setSn(e.target.value.trim())}
          className="mt-2 w-full rounded-2xl border border-[#d6e5e1] bg-[#f7fbfa] px-5 py-4 text-base text-[#17201d] outline-none transition placeholder:text-slate-400 focus:border-[#286f52] focus:bg-white focus:ring-4 focus:ring-[#286f52]/10"
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-[#3f4b47]">Device label</span>
        <input
          placeholder="Morning CGM"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-[#d6e5e1] bg-[#f7fbfa] px-5 py-4 text-base text-[#17201d] outline-none transition placeholder:text-slate-400 focus:border-[#286f52] focus:bg-white focus:ring-4 focus:ring-[#286f52]/10"
        />
      </label>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={busy || !sn}
          className="w-full rounded-full bg-[#286f52] px-6 py-4 text-base font-bold text-white shadow-[0_18px_45px_rgba(40,111,82,0.22)] transition hover:bg-[#225f47] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
        >
          {busy ? "Linking..." : "Link device"}
        </button>
      </div>

      {error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 lg:col-span-3">
          {error}
        </p>
      )}
    </form>
  );
}
