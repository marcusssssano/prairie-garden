import Stripe from "stripe";

// Server-only — never import this from a Client Component. Used to create
// PaymentIntents and to verify webhook signatures.
export function createStripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
