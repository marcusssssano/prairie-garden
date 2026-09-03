"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import MelinaGuide from "@/components/MelinaGuide";

// How long to keep auto-checking a still-pending order before giving up
// and falling back to "refresh the page" — the webhook is usually done
// within a second or two, this just covers the slow/retry cases.
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 15;

type OrderItem = {
  plant_id: string;
  quantity: number;
  price_cents_at_purchase: number;
  plants: { name: string } | null;
};

type Order = {
  id: string;
  status: string;
  total_cents: number;
  shipping_address: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  created_at: string;
  items: OrderItem[];
};

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopPolling() {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }

  function pollWhilePending(fetcher: () => Promise<Order | null>, attempt = 0) {
    stopPolling();
    if (attempt >= MAX_POLL_ATTEMPTS) return;
    pollTimeoutRef.current = setTimeout(async () => {
      const result = await fetcher();
      if (!result) return;
      setOrder(result);
      if (result.status === "pending") {
        pollWhilePending(fetcher, attempt + 1);
      }
    }, POLL_INTERVAL_MS);
  }

  async function lookupOrder(email: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "We couldn't find that order.");
        setOrder(null);
      } else {
        setOrder(data);
        if (data.status === "pending") {
          pollWhilePending(async () => {
            const r = await fetch(`/api/orders/${params.id}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            return r.ok ? ((await r.json()) as Order) : null;
          });
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function initialLookup() {
      // If we're logged in and it's our order, RLS lets us fetch it
      // directly with no email needed.
      setLoading(true);
      const sessionFetcher = async () => {
        const response = await fetch(`/api/orders/${params.id}`);
        return response.ok ? ((await response.json()) as Order) : null;
      };
      try {
        const result = await sessionFetcher();
        if (result) {
          setOrder(result);
          setLoading(false);
          if (result.status === "pending") pollWhilePending(sessionFetcher);
          return;
        }
      } catch {
        // fall through to the guest-email path below
      }
      setLoading(false);

      const storedEmail = sessionStorage.getItem(
        "prairie-garden-checkout-email"
      );
      if (storedEmail) {
        lookupOrder(storedEmail);
      }
    }
    initialLookup();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (!order) {
    return (
      <main className="mx-auto max-w-md px-6 py-20">
        <h1 className="font-display text-2xl italic text-forest">
          Find your order
        </h1>
        <p className="mt-2 font-body text-sm text-forest/60">
          Enter the email you checked out with to view this order.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookupOrder(emailInput);
          }}
          className="mt-5 flex gap-2"
        >
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-clay px-5 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:opacity-50"
          >
            {loading ? "Looking…" : "Find order"}
          </button>
        </form>
        {error && (
          <p className="mt-3 font-body text-sm text-clay" role="alert">
            {error}
          </p>
        )}
      </main>
    );
  }

  const isPaid = order.status === "paid" || order.status === "fulfilled";
  const isCancelled = order.status === "cancelled";

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
        {isPaid ? "Order confirmed" : isCancelled ? "Order cancelled" : "Order received"}
      </span>
      <h1 className="mt-2 font-display text-3xl italic text-forest">
        {isPaid
          ? "Thank you for your order!"
          : isCancelled
            ? "This order was cancelled."
            : "We're confirming your payment…"}
      </h1>
      {!isPaid && !isCancelled && (
        <p className="mt-2 font-body text-sm text-forest/60">
          This usually only takes a second or two — this page updates on
          its own, no need to refresh.
        </p>
      )}
      {isCancelled && (
        <p className="mt-2 font-body text-sm text-forest/60">
          No payment was taken. If this wasn&apos;t intentional, feel free to
          try checking out again.
        </p>
      )}

      {isPaid && (
        <div className="mt-6 flex justify-center">
          <MelinaGuide
            pose="celebrating"
            message="Yay, your plants are on their way! I'll be here if you need care tips."
          />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-forest/10 bg-bg-soft p-6 text-left">
        <div className="flex items-center justify-between font-body text-sm text-forest/70">
          <span>Order</span>
          <span className="font-mono text-xs text-forest">{order.id}</span>
        </div>

        <ul className="mt-4 divide-y divide-forest/10">
          {order.items.map((item) => (
            <li
              key={item.plant_id}
              className="flex items-center justify-between py-3 font-body text-sm text-forest"
            >
              <span>
                {item.plants?.name ?? "Plant"} × {item.quantity}
              </span>
              <span className="font-mono text-forest/70">
                {formatPrice(item.price_cents_at_purchase * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-4 font-body text-sm font-medium text-forest">
          <span>Total</span>
          <span className="font-mono">{formatPrice(order.total_cents)}</span>
        </div>

        <div className="mt-6 border-t border-forest/10 pt-4">
          <h2 className="font-display text-base text-forest">
            Shipping to
          </h2>
          <p className="mt-1 font-body text-sm text-forest/70">
            {order.shipping_address.fullName}
            <br />
            {order.shipping_address.line1}
            {order.shipping_address.line2 && (
              <>
                <br />
                {order.shipping_address.line2}
              </>
            )}
            <br />
            {order.shipping_address.city}, {order.shipping_address.province}{" "}
            {order.shipping_address.postalCode}
            <br />
            {order.shipping_address.country}
          </p>
        </div>
      </div>

      <Link
        href="/shop"
        className="mt-8 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
      >
        Continue shopping
      </Link>
    </main>
  );
}
