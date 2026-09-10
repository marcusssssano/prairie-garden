"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLastShopUrl } from "@/lib/shopUrl";

export default function SiteHeader() {
  const router = useRouter();
  const distinctItems = useCartStore((state) => state.items.length);
  const { user, isAdmin } = useAuth();
  // Picks up filters from the last time you were on the shop grid, and
  // updates live as the tracker records new ones. Always the grid, never
  // a specific plant, and the link always just says "Shop".
  const shopHref = useLastShopUrl();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl italic text-forest">
          Prairie Garden
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="font-body text-sm text-forest/70 transition-colors hover:text-forest"
          >
            Home
          </Link>
          {/* An admin account manages the store, it doesn't shop — no
              Shop link, cart, or order history clutter for that role. */}
          {!isAdmin && (
            <Link
              href={shopHref}
              className="font-body text-sm text-forest/70 transition-colors hover:text-forest"
            >
              Shop
            </Link>
          )}
          {user && !isAdmin && (
            <Link
              href="/account/orders"
              className="font-body text-sm text-forest/70 transition-colors hover:text-forest"
            >
              Orders
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="font-body text-sm text-sage-deep transition-colors hover:text-sage-deep/80"
            >
              Admin
            </Link>
          )}
          {!isAdmin && (
            <Link href="/cart" className="relative" aria-label="Cart">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3D4A31"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {distinctItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 font-mono text-[10px] text-white">
                  {distinctItems}
                </span>
              )}
            </Link>
          )}

          <div className="ml-2 border-l border-forest/10 pl-6">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="font-body text-sm text-forest/70 transition-colors hover:text-forest"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="font-body text-sm text-forest/70 transition-colors hover:text-forest"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
