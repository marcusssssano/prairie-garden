import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  order_items: {
    quantity: number;
    price_cents_at_purchase: number;
    plants: { name: string } | null;
  }[];
};

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS ("users read own orders") already scopes this to the current
  // user — no explicit .eq("user_id", ...) needed, and none would help
  // anyway since only the policy is what actually enforces it.
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "id, status, total_cents, created_at, order_items(quantity, price_cents_at_purchase, plants(name))"
    )
    .order("created_at", { ascending: false })
    .returns<OrderRow[]>();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl italic text-forest">
        Your orders
      </h1>

      {(!orders || orders.length === 0) && (
        <div className="mt-8 text-center">
          <p className="font-body text-sm text-forest/60">
            You haven&apos;t placed any orders yet.
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          >
            Browse the shop
          </Link>
        </div>
      )}

      {orders && orders.length > 0 && (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="rounded-2xl border border-forest/10 bg-bg-soft p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-forest/60">
                  {order.id}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
                    order.status === "paid" || order.status === "fulfilled"
                      ? "bg-sage-deep/15 text-sage-deep"
                      : order.status === "cancelled"
                        ? "bg-clay/15 text-clay"
                        : "bg-forest/10 text-forest/60"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <p className="mt-1 font-body text-xs text-forest/50">
                {new Date(order.created_at).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <ul className="mt-3 divide-y divide-forest/10">
                {order.order_items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between py-2 font-body text-sm text-forest/80"
                  >
                    <span>
                      {item.plants?.name ?? "Plant"} × {item.quantity}
                    </span>
                    <span className="font-mono">
                      {formatPrice(
                        item.price_cents_at_purchase * item.quantity
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-forest/10 pt-3 font-body text-sm font-medium text-forest">
                <span>Total</span>
                <span className="font-mono">
                  {formatPrice(order.total_cents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
