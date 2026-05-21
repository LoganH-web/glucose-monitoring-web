import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddDeviceForm } from "@/components/AddDeviceForm";

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();
  const { data: devices } = await supabase
    .from("devices")
    .select("id, sn, label, linked_at")
    .order("linked_at", { ascending: false });

  const linkedDevices = devices ?? [];

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-semibold text-blue-700">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
            AI Wellness workspace
          </div>

          <h1 className="mt-8 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl">
            Manage your connected glucose devices.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Link a CGM device by serial number, then open the device profile to
            sync readings, review the 14-day trend, and generate AI-assisted
            wellness summaries.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-blue-100 bg-white p-6 shadow-[0_24px_80px_rgba(37,99,235,0.08)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Linked devices
          </p>
          <p className="mt-3 text-5xl font-black tracking-tight text-blue-700">
            {linkedDevices.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {linkedDevices.length === 1
              ? "One CGM device is ready for analysis."
              : "CGM devices available for glucose review."}
          </p>
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-blue-100 bg-white p-6 shadow-[0_28px_100px_rgba(37,99,235,0.08)] backdrop-blur">
        <div className="rounded-[1.75rem] bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Device setup
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Link a new device
              </h2>
            </div>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
              Manual sync
            </span>
          </div>

          <AddDeviceForm />
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-blue-100 bg-white p-6 shadow-[0_28px_100px_rgba(37,99,235,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Device library
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Linked devices</h2>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Select a device to review readings and insights.
          </p>
        </div>

        {linkedDevices.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-blue-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-950">No devices yet</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add your CGM serial number above to start building a glucose
              history.
            </p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {linkedDevices.map((device) => (
              <li key={device.id}>
                <Link
                  href={`/dashboard/${encodeURIComponent(device.sn)}`}
                  className="group block rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_60px_rgba(37,99,235,0.10)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-slate-950">
                        {device.label || device.sn}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        SN: {device.sn}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 4L12 9L7 14"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-blue-100 pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                      <span className="h-2 w-2 rounded-full bg-blue-700" />
                      Ready
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      Linked {new Date(device.linked_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
