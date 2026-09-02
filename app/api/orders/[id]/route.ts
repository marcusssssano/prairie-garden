import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// For a logged-in user, RLS ("users read own orders") already restricts
// this to orders they own — no service role or email check needed here,
// the policy itself is what enforces it. Returns 404 rather than 401 for
// "not logged in" or "not yours", same as the guest path below, so this
// can't be used to probe which order ids exist.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total_cents, shipping_address, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("plant_id, quantity, price_cents_at_purchase, plants(name)")
    .eq("order_id", order.id);

  return NextResponse.json({ ...order, items: items ?? [] });
}

// Guest orders aren't selectable via the public anon/authenticated role at
// all (see supabase/schema.sql) — a guest proves ownership here with the
// email they checked out with, server-side, instead of a direct table
// query the browser could use to enumerate other people's orders.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let email: string | undefined;
  try {
    const body = await request.json();
    email = body.email;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, total_cents, shipping_address, guest_email, created_at")
    .eq("id", id)
    .maybeSingle();

  // Same 404 whether the order doesn't exist or the email doesn't match —
  // don't reveal which, or the endpoint becomes an order-existence oracle.
  if (
    !order ||
    !order.guest_email ||
    order.guest_email.toLowerCase().trim() !== email.toLowerCase().trim()
  ) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("plant_id, quantity, price_cents_at_purchase, plants(name)")
    .eq("order_id", order.id);

  return NextResponse.json({
    id: order.id,
    status: order.status,
    total_cents: order.total_cents,
    shipping_address: order.shipping_address,
    created_at: order.created_at,
    items: items ?? [],
  });
}
