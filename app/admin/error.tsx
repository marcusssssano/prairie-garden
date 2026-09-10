"use client";

import Link from "next/link";
import { useEffect } from "react";

// Admin-side equivalent of the shop error boundary. Kept plainer on
// purpose — this audience wants to know what broke and get back to work,
// not be reassured by the mascot.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="py-12 text-center">
      <h1 className="font-display text-2xl italic text-forest">
        Something went wrong
      </h1>
      <p className="mt-2 font-body text-sm text-forest/60">
        This page failed to load. If it keeps happening, check that the
        database is reachable.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-forest/40">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-clay px-6 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="rounded-full border border-forest/20 px-6 py-2.5 font-body text-sm font-medium text-forest/70 transition-colors hover:border-forest/40 hover:text-forest"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
