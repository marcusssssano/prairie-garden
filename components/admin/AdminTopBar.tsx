"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminTopBar() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-display text-lg italic text-forest sm:text-xl">
            Prairie Garden
          </span>
          <span className="rounded-full bg-sage-deep/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-sage-deep">
            Admin
          </span>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="whitespace-nowrap font-body text-sm text-forest/70 transition-colors hover:text-forest"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="whitespace-nowrap font-body text-sm text-forest/70 transition-colors hover:text-forest"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
