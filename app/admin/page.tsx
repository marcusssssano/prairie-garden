import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

// Matches the "Only N left" threshold used on the shop-facing plant
// detail page, so "low stock" means the same thing everywhere.
const LOW_STOCK_THRESHOLD = 5;

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-forest/10 bg-bg-soft p-5">
      <p className="font-mono text-[10px] uppercase tracking-wide text-forest/50">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl text-forest">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ data: plants }, { data: orders }] = await Promise.all([
    supabase.from("plants").select("id, name, stock").order("stock"),
    supabase.from("orders").select("id, status, total_cents, created_at"),
  ]);

  const lowStockPlants = (plants ?? []).filter(
    (p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );
  const outOfStockCount = (plants ?? []).filter((p) => p.stock <= 0).length;

  const pendingOrders = (orders ?? [])
    .filter((o) => o.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  const revenueCents = (orders ?? [])
    .filter((o) => o.status === "paid" || o.status === "fulfilled")
    .reduce((sum, o) => sum + o.total_cents, 0);

  return (
    <div>
      <h1 className="font-display text-2xl italic text-forest">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Plants" value={String(plants?.length ?? 0)} />
        <StatCard label="Pending orders" value={String(pendingOrders.length)} />
        <StatCard label="Revenue (paid)" value={formatPrice(revenueCents)} />
        <StatCard
          label="Out of stock"
          value={String(outOfStockCount)}
        />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-forest/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest">
              Needs fulfilling
            </h2>
            <Link
              href="/admin/orders"
              className="font-body text-sm text-sage-deep hover:underline"
            >
              View all
            </Link>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="mt-3 font-body text-sm text-forest/60">
              No pending orders right now.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-forest/10">
              {pendingOrders.slice(0, 5).map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-3 py-2.5 font-body text-sm"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-forest/60">
                    {order.id}
                  </span>
                  <span className="shrink-0 font-mono text-forest">
                    {formatPrice(order.total_cents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-forest/10 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-forest">Low stock</h2>
            <Link
              href="/admin/plants"
              className="font-body text-sm text-sage-deep hover:underline"
            >
              View all
            </Link>
          </div>
          {lowStockPlants.length === 0 ? (
            <p className="mt-3 font-body text-sm text-forest/60">
              Everything&apos;s well stocked.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-forest/10">
              {lowStockPlants.map((plant) => (
                <li
                  key={plant.id}
                  className="flex items-center justify-between gap-3 py-2.5 font-body text-sm"
                >
                  <Link
                    href={`/admin/plants/${plant.id}/edit`}
                    className="min-w-0 flex-1 truncate text-forest hover:text-sage-deep hover:underline"
                  >
                    {plant.name}
                  </Link>
                  <span className="shrink-0 font-mono text-clay">
                    {plant.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
