import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/server";

// This is the ONLY place an order is ever marked 'paid'. The signature
// check below proves the request genuinely came from Stripe — without it,
// anyone could POST a fake "payment succeeded" body and get a free order.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const stripe = createStripeClient();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .maybeSingle();

    // Already processed (Stripe can redeliver the same event) — no-op.
    if (!order || order.status !== "pending") {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id);

    const { data: orderItems } = await supabase
      .from("order_items")
      .select("plant_id, quantity")
      .eq("order_id", order.id);

    for (const item of orderItems ?? []) {
      // Atomic decrement (a single UPDATE ... SET stock = stock - qty on
      // the database side) rather than reading stock then writing it back
      // — the read-then-write version could lose a decrement if two
      // orders for the same plant were confirmed close together.
      await supabase.rpc("decrement_plant_stock", {
        p_plant_id: item.plant_id,
        p_quantity: item.quantity,
      });
    }
  }

  // Deliberately not handling payment_intent.payment_failed: the checkout
  // page reuses the same PaymentIntent across retries (see app/checkout),
  // so one failed attempt doesn't mean the order is dead — the very next
  // attempt on that same PaymentIntent can still succeed. Marking the
  // order 'cancelled' here would race with that and could permanently
  // strand a successfully-paid order in the wrong status. A pending order
  // that's genuinely abandoned just stays 'pending' — visible to admins,
  // who can cancel it manually from the orders dashboard.

  return NextResponse.json({ received: true });
}
