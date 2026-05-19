import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddDeviceForm } from "@/components/AddDeviceForm";

export default async function DashboardHome() {
  const supabase = createSupabaseServerClient();
  const { data: devices } = await supabase
    .from("devices")
    .select("id, sn, label, linked_at")
    .order("linked_at", { ascending: false });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold">Your devices</h1>
        <p className="mt-1 text-sm text-slate-600">
          Link an Eaglenos CGM by its serial number, then pull its readings.
        </p>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="font-medium">Link a new device</h2>
        <AddDeviceForm />
      </section>

      <section>
        <h2 className="font-medium">Linked</h2>
        {!devices || devices.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No devices yet.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border bg-white">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <Link
                    href={`/dashboard/${encodeURIComponent(d.sn)}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {d.label || d.sn}
                  </Link>
                  <p className="text-xs text-slate-500">
                    SN: {d.sn} · linked {new Date(d.linked_at).toLocaleDateString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
