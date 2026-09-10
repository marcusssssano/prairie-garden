"use client";

import { useSyncExternalStore } from "react";

// The last-visited /shop *grid* URL (with filters), tracked in
// sessionStorage. Only updated by the shop page itself. Used by the
// header's "Shop" nav link and the plant detail page's "Back to shop"
// link — both always say "Shop"/"Back to shop" and always mean the grid;
// neither one ever points at a specific plant page. (Returning to "the
// item you were just looking at" is a separate, genuine back-navigation
// action — see the cart page's back link, which uses real browser
// history instead of this tracking.)
//
// Exposed as a tiny external store rather than "read it in an effect and
// setState", which costs an extra render pass on every mount and is what
// react-hooks/set-state-in-effect flags. useSyncExternalStore is built
// for exactly this: a client-only source with an SSR-safe fallback, so
// the server and the hydrating client both start from /shop and no
// hydration mismatch is possible.
const LAST_SHOP_URL_KEY = "prairie-garden-last-shop-url";
const DEFAULT_SHOP_URL = "/shop";

type Listener = () => void;

const listeners = new Set<Listener>();

// getSnapshot has to return a stable value between writes — handing back
// a freshly-read string every call would re-render forever.
let snapshot: string | null = null;

function readFromStorage(): string {
  if (typeof window === "undefined") return DEFAULT_SHOP_URL;
  try {
    return sessionStorage.getItem(LAST_SHOP_URL_KEY) ?? DEFAULT_SHOP_URL;
  } catch {
    // Private mode / storage disabled — the link just falls back to the
    // unfiltered grid rather than breaking the page.
    return DEFAULT_SHOP_URL;
  }
}

export function setLastShopUrl(url: string) {
  try {
    sessionStorage.setItem(LAST_SHOP_URL_KEY, url);
  } catch {
    // Non-fatal: the link keeps whatever it had.
  }
  if (snapshot !== url) {
    snapshot = url;
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string {
  if (snapshot === null) snapshot = readFromStorage();
  return snapshot;
}

function getServerSnapshot(): string {
  return DEFAULT_SHOP_URL;
}

export function useLastShopUrl(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
