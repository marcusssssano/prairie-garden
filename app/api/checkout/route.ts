import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createStripeClient } from "@/lib/stripe/server";

type CheckoutItem = { plantId: string; quantity: number };

type ShippingAddress = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
};

// Mirrors the maxLength attributes on the checkout form — those are just
// UX, this is the actual enforcement, since anyone can call this route
// directly with whatever they want in the body.
function isBoundedString(value: unknown, maxLength: number, required = true) {
  if (typeof value !== "string") return !required && value === undefined;
  const trimmed = value.trim();
  if (required && trimmed.length === 0) return false;
  return value.length <= maxLength;
}

function isValidShippingAddress(value: unknown): value is ShippingAddress {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    isBoundedString(a.fullName, 100) &&
    isBoundedString(a.line1, 200) &&
    isBoundedString(a.line2, 200, false) &&
    isBoundedString(a.city, 100) &&
    isBoundedString(a.province, 100) &&
    isBoundedString(a.postalCode, 20) &&
    isBoundedString(a.country, 100) &&
    isBoundedString(a.phone, 20)
  );
}

export async function POST(request: Request) {
  let body: {
    items?: CheckoutItem[];
    email?: string;
    shippingAddress?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, email, shippingAddress } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (
    !email ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "A valid email address is required." },
      { status: 400 }
    );
  }
  if (!isValidShippingAddress(shippingAddress)) {
    return NextResponse.json(
      { error: "A complete shipping address is required." },
      { status: 400 }
    );
  }
  for (const item of items) {
    if (
      typeof item.plantId !== "string" ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return NextResponse.json(
        { error: "Your cart contains an invalid item." },
        { status: 400 }
      );
    }
  }

  // The regular (cookie-aware) client, only to check whether the request
  // is coming from a logged-in session — not used for any writes.
  const sessionClient = await createClient();
  const {
    data: { user },
  } = await sessionClient.auth.getUser();

  const supabase = createServiceClient();

  // Recompute everything from the database — prices and stock coming from
  // the request body are never trusted, since the browser could send
  // anything.
  const plantIds = items.map((i) => i.plantId);
  const { data: plants, error: plantsError } = await supabase
    .from("plants")
    .select("id, name, price_cents, stock")
    .in("id", plantIds)
    .returns<{ id: string; name: string; price_cents: number; stock: number }[]>();

  if (plantsError || !plants) {
    return NextResponse.json(
      { error: "Could not verify your cart. Please try again." },
      { status: 500 }
    );
  }

  const plantsById = new Map(plants.map((p) => [p.id, p]));
  let totalCents = 0;
  const orderItemsToInsert: {
    plant_id: string;
    quantity: number;
    price_cents_at_purchase: number;
  }[] = [];

  for (const item of items) {
    const plant = plantsById.get(item.plantId);
    if (!plant) {
      return NextResponse.json(
        { error: "One of the plants in your cart no longer exists." },
        { status: 400 }
      );
    }
    if (item.quantity > plant.stock) {
      return NextResponse.json(
        {
          error: `Only ${plant.stock} of ${plant.name} left in stock — please update your cart.`,
        },
        { status: 409 }
      );
    }
    totalCents += plant.price_cents * item.quantity;
    orderItemsToInsert.push({
      plant_id: plant.id,
      quantity: item.quantity,
      price_cents_at_purchase: plant.price_cents,
    });
  }

  // Created as 'pending' now, from trusted server code — this is NOT a
  // payment confirmation. Only the Stripe webhook (verified by signature)
  // flips it to 'paid', once Stripe itself confirms the charge succeeded.
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: email,
      status: "pending",
      total_cents: totalCents,
      shipping_address: shippingAddress,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItemsToInsert.map((item) => ({ ...item, order_id: order.id }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "Could not create your order. Please try again." },
      { status: 500 }
    );
  }

  const stripe = createStripeClient();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "php",
    payment_method_types: ["card"],
    metadata: { order_id: order.id },
  });

  const { error: updateError } = await supabase
    .from("orders")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    orderId: order.id,
  });
}
