import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-7 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-full border border-blue-100 bg-white px-6 py-3 text-xl font-semibold shadow-[0_18px_50px_rgba(37,99,235,0.08)] backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center text-blue-700">
              <span className="block h-0 w-0 border-x-[8px] border-b-[24px] border-x-transparent border-b-blue-700" />
            </span>
            AI Wellness
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_0.86fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
              AI Wellness 14-day glucose review
            </div>

            <h1 className="mt-8 max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Understand your glucose readings
              <span className="block text-blue-700">before you log in.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Sign in to connect your CGM device, sync recent readings, and
              review a focused dashboard for highs, lows, time in range, and
              glucose trends.
            </p>
          </div>

          <div className="relative">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
