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
          <div className="inline-flex items-center gap-3 rounded-full border border-[#cfe1dd] bg-[#e4f1ee] px-5 py-3 text-sm font-semibold text-[#286f52]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#286f52]" />
            AI Wellness workspace
          </div>

          <h1 className="mt-8 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-[#161b19] sm:text-4xl">
            Manage your connected glucose devices.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#68736f]">
            Link a CGM device by serial number, then open the device profile to
            sync readings, review the 14-day trend, and generate AI-assisted
            wellness summaries.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-[#d8e8e4] bg-white/60 p-6 shadow-[0_24px_80px_rgba(27,78,66,0.10)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68736f]">
            Linked devices
          </p>
          <p className="mt-3 text-5xl font-black tracking-tight text-[#286f52]">
            {linkedDevices.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-[#68736f]">
            {linkedDevices.length === 1
              ? "One CGM device is ready for analysis."
              : "CGM devices available for glucose review."}
          </p>
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-[#d8e8e4] bg-white/55 p-6 shadow-[0_28px_100px_rgba(27,78,66,0.10)] backdrop-blur">
        <div className="rounded-[1.75rem] bg-white/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68736f]">
                Device setup
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#161b19]">
                Link a new device
              </h2>
            </div>
            <span className="rounded-full bg-[#e4f1ee] px-4 py-2 text-xs font-bold text-[#286f52]">
              Manual sync
            </span>
          </div>

          <AddDeviceForm />
        </div>
      </section>

      <section className="rounded-[2.25rem] border border-[#d8e8e4] bg-white/55 p-6 shadow-[0_28px_100px_rgba(27,78,66,0.10)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#68736f]">
              Device library
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#161b19]">Linked devices</h2>
          </div>
          <p className="text-sm font-medium text-[#68736f]">
            Select a device to review readings and insights.
          </p>
        </div>

        {linkedDevices.length === 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-dashed border-[#cfe1dd] bg-[#f7fbfa] px-6 py-10 text-center">
            <p className="text-base font-semibold text-[#17201d]">No devices yet</p>
            <p className="mt-2 text-sm leading-6 text-[#68736f]">
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
                  className="group block rounded-[1.75rem] border border-[#e1ece9] bg-white/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bcd8d1] hover:bg-white hover:shadow-[0_18px_60px_rgba(27,78,66,0.10)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-[#161b19]">
                        {device.label || device.sn}
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#68736f]">
                        SN: {device.sn}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f1ee] text-[#286f52] transition group-hover:bg-[#286f52] group-hover:text-white">
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

                  <div className="mt-5 flex items-center justify-between border-t border-[#e1ece9] pt-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#e4f1ee] px-3 py-1.5 text-xs font-bold text-[#286f52]">
                      <span className="h-2 w-2 rounded-full bg-[#286f52]" />
                      Ready
                    </span>
                    <span className="text-xs font-semibold text-[#68736f]">
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
