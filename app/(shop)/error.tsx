"use client";

import Link from "next/link";
import { useEffect } from "react";
import MelinaGuide from "@/components/MelinaGuide";

// Catches render/data failures anywhere in the customer-facing pages —
// most realistically Supabase being unreachable (paused free-tier project,
// network blip). Without this, that surfaces as Next's unstyled default
// error screen, which is a jarring way to meet a shop.
export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server errors are already logged server-side; this covers the
    // client-side ones so they're not lost entirely.
    console.error("Shop page error:", error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
        Something went wrong
      </span>
      <h1 className="mt-2 font-display text-3xl italic text-forest">
        We couldn&apos;t load this page.
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        This is usually temporary — trying again often sorts it out.
      </p>

      <div className="mt-8 flex justify-center">
        <MelinaGuide
          pose="thinking"
          message="Something's not quite right on our end. Give it another go?"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-forest/20 px-8 py-3 font-body text-sm font-medium text-forest/70 transition-colors hover:border-forest/40 hover:text-forest"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
