"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  useCartStore,
  cartTotalCents,
  selectedCartItems,
  type CartItem,
} from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/client";
import { takeBuyNowItem } from "@/lib/buyNow";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "15px",
      fontFamily: "Inter, sans-serif",
      color: "#3D4A31",
      "::placeholder": { color: "#3D4A3199" },
    },
    invalid: { color: "#C98B5B" },
  },
};

function CheckoutForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);

  // A "Buy now" purchase is a standalone item, completely separate from
  // whatever's selected in the cart — takeBuyNowItem() is one-time-use
  // (clears itself on read), so this only ever applies to the checkout
  // load that immediately follows clicking Buy now.
  const [buyNowItem, setBuyNowItem] = useState<CartItem | null | undefined>(
    undefined
  );
  // takeBuyNowItem() clears sessionStorage as it reads — not safe to call
  // twice. React's Strict Mode intentionally double-invokes effects in
  // dev, and a second call would find nothing and overwrite the correct
  // result with null, so this ref makes sure only the first call counts.
  const buyNowConsumedRef = useRef(false);
  useEffect(() => {
    if (buyNowConsumedRef.current) return;
    buyNowConsumedRef.current = true;
    const item = takeBuyNowItem();
    setBuyNowItem(item ? { ...item, selected: true } : null);
  }, []);

  const selected =
    buyNowItem === undefined
      ? [] // still checking sessionStorage — don't show the cart yet
      : buyNowItem
        ? [buyNowItem]
        : selectedCartItems(items);
  const subtotalCents = cartTotalCents(selected);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country] = useState("Philippines");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set once the order + PaymentIntent are created server-side. Reused on
  // retry after a declined card so a fumbled card number doesn't leave a
  // fresh orphaned "pending" order behind every attempt.
  const [session, setSession] = useState<{ orderId: string; clientSecret: string } | null>(null);

  // Logged-in users shouldn't have to retype an email we already know —
  // only fills it in if they haven't already typed something themselves.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail((current) => current || data.user!.email!);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      let checkoutSession = session;

      if (!checkoutSession) {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: selected.map((i) => ({
              plantId: i.plantId,
              quantity: i.quantity,
            })),
            email,
            shippingAddress: {
              fullName,
              phone: `+63${phone}`,
              line1,
              line2: line2 || undefined,
              city,
              province,
              postalCode,
              country,
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
          setSubmitting(false);
          return;
        }

        checkoutSession = { orderId: data.orderId, clientSecret: data.clientSecret };
        setSession(checkoutSession);
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Payment form not ready — please try again.");
        setSubmitting(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        checkoutSession.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: { name: fullName, email },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message ?? "Payment failed. Please try again.");
        setSubmitting(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // A Buy now purchase was never in the cart, so there's nothing to
        // remove from it — clearing by plantId here would risk wiping out
        // an unrelated, separately-added cart entry for the same plant.
        if (!buyNowItem) {
          selected.forEach((item) => removeItem(item.plantId));
        }
        sessionStorage.setItem("prairie-garden-checkout-email", email);
        router.push(`/order-confirmation/${checkoutSession.orderId}`);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (buyNowItem === undefined) {
    // Briefly checking sessionStorage for a pending Buy now item — avoids
    // flashing "no items selected" for cart checkouts that do have items.
    return null;
  }

  if (selected.length === 0) {
    return (
      <p className="font-body text-sm text-forest/60">
        No items selected — go back to your cart and select what you&apos;d
        like to buy.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-start">
      <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        <div>
          <h2 className="font-display text-lg text-forest">Contact</h2>
          <label className="mt-3 block font-body text-sm text-forest/70">
            Email
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
            />
          </label>
        </div>

        <div>
          <h2 className="font-display text-lg text-forest">
            Shipping address
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block font-body text-sm text-forest/70 sm:col-span-2">
              Full name
              <input
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70 sm:col-span-2">
              Phone
              <div className="mt-1 flex items-stretch overflow-hidden rounded-lg border border-forest/20 bg-bg focus-within:border-sage-deep">
                <span className="flex items-center border-r border-forest/20 bg-bg-soft px-3 font-mono text-sm text-forest/60">
                  +63
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="9XX XXX XXXX"
                  pattern="9[0-9]{9}"
                  title="A 10-digit PH mobile number starting with 9 (e.g. 9171234567)"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  className="w-full bg-transparent px-3 py-2 font-body text-sm text-forest focus:outline-none"
                />
              </div>
              <span className="mt-1 block font-body text-xs text-forest/50">
                Your delivery rider will use this to reach you — needs to be
                a PH mobile number.
              </span>
            </label>
            <label className="block font-body text-sm text-forest/70 sm:col-span-2">
              Address line 1
              <input
                type="text"
                required
                maxLength={200}
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70 sm:col-span-2">
              Address line 2 (optional)
              <input
                type="text"
                maxLength={200}
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70">
              City
              <input
                type="text"
                required
                maxLength={100}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70">
              Province
              <input
                type="text"
                required
                maxLength={100}
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70">
              Postal code
              <input
                type="text"
                required
                maxLength={20}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep"
              />
            </label>
            <label className="block font-body text-sm text-forest/70">
              Country
              <input
                type="text"
                disabled
                value={country}
                className="mt-1 w-full rounded-lg border border-forest/20 bg-bg-soft px-3 py-2 font-body text-sm text-forest/60"
              />
            </label>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-forest">Payment</h2>
          <p className="mt-1 font-body text-xs text-forest/50">
            Test mode — use card number 4242 4242 4242 4242, any future
            expiry, any CVC.
          </p>
          <div className="mt-3 rounded-lg border border-forest/20 bg-bg px-3 py-3">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <p className="font-body text-sm text-clay" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!stripe || submitting}
          className="w-full rounded-full bg-clay px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Processing…" : `Pay ${formatPrice(subtotalCents)}`}
        </button>
      </form>

      <aside className="w-full rounded-2xl border border-forest/10 bg-bg-soft p-6 md:w-72">
        <h2 className="font-display text-lg text-forest">Order summary</h2>
        <ul className="mt-4 space-y-3">
          {selected.map((item) => (
            <li
              key={item.plantId}
              className="flex justify-between font-body text-sm text-forest/70"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-mono">
                {formatPrice(item.price_cents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-4 font-body text-sm font-medium text-forest">
          <span>Total</span>
          <span className="font-mono">{formatPrice(subtotalCents)}</span>
        </div>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-3xl italic text-forest">Checkout</h1>
      <div className="mt-8">
        <Elements stripe={getStripe()}>
          <CheckoutForm />
        </Elements>
      </div>
    </main>
  );
}
