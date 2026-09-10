import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MelinaGuide from "@/components/MelinaGuide";

// Global 404, for URLs that match no route at all and for notFound() calls
// from the shop pages (a plant id that no longer exists). Next resolves
// the root not-found outside the (shop) route group, so the header and
// footer are rendered here directly — a 404 with no navigation is a dead
// end, and this is exactly where someone needs a way back.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex-1 px-6 py-20 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
          404
        </span>
        <h1 className="mt-2 font-display text-3xl italic text-forest">
          This page has wandered off.
        </h1>
        <p className="mt-2 font-body text-sm text-forest/60">
          The link may be old, or the plant may have been taken down.
        </p>

        <div className="mt-8 flex justify-center">
          <MelinaGuide
            pose="thinking"
            message="Hmm, I can't find that one — want to look through the shop instead?"
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
          >
            Browse the shop
          </Link>
          <Link
            href="/"
            className="rounded-full border border-forest/20 px-8 py-3 font-body text-sm font-medium text-forest/70 transition-colors hover:border-forest/40 hover:text-forest"
          >
            Go home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
