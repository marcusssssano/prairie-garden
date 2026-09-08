// A "Buy now" purchase is intentionally kept separate from the persisted
// cart (lib/store/cart.ts) — it should never merge with, add to, or
// checkout alongside whatever's already sitting in the cart. sessionStorage
// (not the cart store) holds this single pending item, and it's read once
// by the checkout page and immediately cleared — a stale "buy now" should
// never resurface on a later, unrelated visit to /checkout.
const BUY_NOW_KEY = "prairie-garden-buy-now";

export type BuyNowItem = {
  plantId: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};

export function setBuyNowItem(item: BuyNowItem) {
  sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(item));
}

// Consumes (reads + clears) the pending buy-now item, if any.
export function takeBuyNowItem(): BuyNowItem | null {
  const raw = sessionStorage.getItem(BUY_NOW_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(BUY_NOW_KEY);
  try {
    return JSON.parse(raw) as BuyNowItem;
  } catch {
    return null;
  }
}
