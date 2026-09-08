import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

type AdminOrderRow = {
  id: string;
  status: string;
  total_cents: number;
  guest_email: string | null;
  user_id: string | null;
  created_at: string;
  order_items: {
    quantity: number;
    plants: { name: string } | null;
  }[];
};

const STATUS_FILTERS = ["all", "pending", "paid", "fulfilled", "cancelled"] as const;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const activeFilter = STATUS_FILTERS.includes(
    statusParam as (typeof STATUS_FILTERS)[number]
  )
    ? (statusParam as (typeof STATUS_FILTERS)[number])
    : "all";

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, status, total_cents, guest_email, user_id, created_at, order_items(quantity, plants(name))"
    )
    .order("created_at", { ascending: false });

  if (activeFilter !== "all") {
    query = query.eq("status", activeFilter);
  }

  const { data: orders, error } = await query.returns<AdminOrderRow[]>();

  return (
    <div>
      <h1 className="font-display text-2xl italic text-forest">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((status) => (
          <Link
            key={status}
            href={status === "all" ? "/admin/orders" : `/admin/orders?status=${status}`}
            className={`rounded-full border px-3 py-1.5 font-body text-sm capitalize transition-colors ${
              activeFilter === status
                ? "border-sage-deep bg-sage-deep text-white"
                : "border-forest/15 bg-bg text-forest/70 hover:border-sage-deep hover:text-forest"
            }`}
          >
            {status}
          </Link>
        ))}
      </div>

      {error && (
        <p className="mt-6 font-body text-sm text-clay">
          Could not load orders: {error.message}
        </p>
      )}

      {!error && orders && orders.length === 0 && (
        <p className="mt-6 font-body text-sm text-forest/60">
          {activeFilter === "all"
            ? "No orders yet."
            : `No ${activeFilter} orders.`}
        </p>
      )}

      {!error && orders && orders.length > 0 && (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );
            return (
              <li
                key={order.id}
                className="rounded-2xl border border-forest/10 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-forest/50">
                      {order.id}
                    </span>
                    <p className="mt-1 font-body text-sm text-forest">
                      {order.guest_email ?? "Registered customer"}
                    </p>
                    <p className="font-body text-xs text-forest/50">
                      {new Date(order.created_at).toLocaleString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <OrderStatusSelect orderId={order.id} status={order.status} />
                </div>

                <p className="mt-3 font-body text-sm text-forest/70">
                  {order.order_items
                    .map((item) => `${item.plants?.name ?? "Plant"} × ${item.quantity}`)
                    .join(", ")}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3 font-body text-sm">
                  <span className="text-forest/60">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </span>
                  <span className="font-mono font-medium text-forest">
                    {formatPrice(order.total_cents)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
