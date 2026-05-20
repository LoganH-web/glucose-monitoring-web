import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#eef8f6] text-[#17201d]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-7 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-full border border-white/80 bg-white/80 px-6 py-3 text-xl font-semibold shadow-[0_18px_50px_rgba(27,78,66,0.08)] backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center text-[#286f52]">
              <span className="block h-0 w-0 border-x-[8px] border-b-[24px] border-x-transparent border-b-[#286f52]" />
            </span>
            Eaglenos
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1fr_0.86fr] lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#cfe1dd] bg-[#e4f1ee] px-5 py-3 text-sm font-semibold text-[#286f52]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#286f52]" />
              Eaglenos CGM 14-day glucose review
            </div>

            <h1 className="mt-8 max-w-xl text-3xl font-bold leading-tight tracking-tight text-[#161b19] sm:text-4xl">
              Understand your glucose readings
              <span className="block text-[#286f52]">before you log in.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#68736f]">
              Sign in to connect your Eaglenos CGM device, sync recent readings,
              and review a focused dashboard for highs, lows, time in range, and
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
