"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type PromptKey = "how_so_far" | "how_to_improve";

const PROMPTS: { key: PromptKey; label: string }[] = [
  { key: "how_so_far", label: "How's the measurement so far?" },
  { key: "how_to_improve", label: "How can I improve from here?" },
];

const mdComponents: Components = {
  h2: ({ children }) => (
    <h3 className="mb-3 mt-5 text-sm font-bold uppercase tracking-[0.14em] text-[#286f52]">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 mt-4 text-sm font-bold uppercase tracking-[0.14em] text-[#3f4b47]">
      {children}
    </h4>
  ),
  ul: ({ children }) => <ul className="space-y-2">{children}</ul>,
  li: ({ children }) => (
    <li className="rounded-2xl border-l-4 border-[#8ec5b6] bg-white/70 px-4 py-3 text-base leading-7 text-[#3f4b47]">
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong className="inline-block rounded-lg bg-amber-100 px-2 py-0.5 text-sm font-bold text-amber-700">
      {children}
    </strong>
  ),
  p: ({ children }) => (
    <p className="text-base leading-7 text-[#3f4b47]">{children}</p>
  ),
};

export function AiInsights({
  deviceId,
  disabled,
}: {
  deviceId: string;
  disabled?: boolean;
}) {
  const [busyKey, setBusyKey] = useState<PromptKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Partial<Record<PromptKey, string>>>({});

  async function ask(key: PromptKey) {
    setBusyKey(key);
    setError(null);
    const res = await fetch("/api/ai/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, prompt_key: key, days: 14 }),
    });
    setBusyKey(null);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(typeof j.error === "string" ? j.error : "Request failed.");
      return;
    }
    const j = await res.json();
    setResponses((prev) => ({ ...prev, [key]: j.markdown as string }));
  }

  return (
    <div className="mt-3 space-y-5">
      <div className="flex flex-col gap-3">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt.key}
            onClick={() => ask(prompt.key)}
            disabled={disabled || busyKey !== null}
            className="rounded-2xl border border-[#d6e5e1] bg-[#f7fbfa] px-5 py-4 text-left text-lg font-semibold text-[#286f52] transition hover:border-[#286f52] hover:bg-white disabled:opacity-50"
          >
            {busyKey === prompt.key ? "Thinking..." : prompt.label}
          </button>
        ))}
      </div>

      {disabled && (
        <p className="text-sm text-[#68736f]">
          Sync some readings first, then ask for insights.
        </p>
      )}
      {error && <p className="text-sm font-medium text-red-700">{error}</p>}

      {PROMPTS.map((prompt) =>
        responses[prompt.key] ? (
          <div key={prompt.key} className="space-y-3">
            <p className="text-lg font-bold text-[#286f52]">{prompt.label}</p>
            <ReactMarkdown components={mdComponents}>
              {responses[prompt.key]!}
            </ReactMarkdown>
          </div>
        ) : null
      )}

      <p className="border-t border-[#d6e5e1] pt-4 text-sm leading-6 text-[#52615d]">
        General lifestyle information only - not medical advice. Always consult a
        healthcare professional.
      </p>
    </div>
  );
}
