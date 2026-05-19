# Glucose Monitoring Web

A Next.js MVP that pulls readings from the **Eaglenos Continuous Glucose Monitoring System** and runs them through Gemini for plain-language insights.

## MVP features
1. Email + password login (Supabase Auth).
2. Link an Eaglenos device by serial number.
3. Pull all readings the device has reported (cached locally; incremental fetch via `max_id`).
4. Ask Gemini "how's the measurement so far?" and "how to improve from here?" on the user's recent history.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase (Auth + Postgres + RLS)
- Eaglenos REST API (signed POST requests)
- Gemini (`@google/generative-ai`)
- Recharts for the time-series chart
- Vitest for the signature-utility test

## Getting started

```bash
npm install
cp .env.local.example .env.local
# fill in Supabase + Eaglenos salt + Gemini API key
npm run dev
```

Open http://localhost:3000.

### Database

Apply `supabase/migrations/0001_init.sql` against your Supabase project (Singapore region recommended, to colocate with the Eaglenos test env). The SQL Editor in the Supabase dashboard works fine.

### Eaglenos signature verification

Before wiring the UI, confirm the signature format matches what Eaglenos expects:

```bash
npm run test            # runs the sign-util unit test
```

Then make a manual `curl` against the test endpoint to confirm the live server accepts our signatures. If you get a signature error from Eaglenos, flip the concat format in `src/lib/eaglenos/sign.ts` (we default to `key1value1key2value2` — the other common variant is `key1=value1&key2=value2`).

## Deploy

This is built for Vercel. Push to GitHub, import on Vercel, paste the same env vars, deploy.

## Out of scope for the MVP
- mg/dL toggle (default mmol/L)
- Clinician / multi-patient mode
- Background sync cron (manual "Sync now" button only)
- PDF report generation (we link out to Eaglenos's `report_url` when present)
- Real-time push / alerts

See `C:\Users\User\.claude\plans\frolicking-splashing-robin.md` for the full plan and rationale.
