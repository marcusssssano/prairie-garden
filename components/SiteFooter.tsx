import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-forest text-bg/80">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-xl italic text-bg">
              Prairie Garden
            </span>
            <p className="mt-3 font-body text-sm text-bg/60">
              Slow-grown houseplants, picked for people who want green
              without the guesswork.
            </p>
            <p className="mt-3 font-body text-xs text-bg/40">
              Currently shipping within the Philippines only.
            </p>
            <div className="mt-4 flex gap-4 font-mono text-xs uppercase tracking-wide text-bg/60">
              <span>Instagram</span>
              <span>Pinterest</span>
              <span>TikTok</span>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-sage">
              Shop
            </h3>
            <ul className="mt-4 space-y-2 font-body text-sm">
              <li>
                <Link href="/shop" className="text-bg/70 hover:text-bg">
                  All plants
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=Foliage"
                  className="text-bg/70 hover:text-bg"
                >
                  Foliage
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=Succulent+%26+Cacti"
                  className="text-bg/70 hover:text-bg"
                >
                  Succulent &amp; Cacti
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=Flowering"
                  className="text-bg/70 hover:text-bg"
                >
                  Flowering
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=Statement"
                  className="text-bg/70 hover:text-bg"
                >
                  Statement
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-sage">
              Support
            </h3>
            <ul className="mt-4 space-y-2 font-body text-sm">
              <li>
                <Link href="/contact" className="text-bg/70 hover:text-bg">
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-returns"
                  className="text-bg/70 hover:text-bg"
                >
                  Shipping &amp; returns
                </Link>
              </li>
              <li>
                <Link href="/care-guides" className="text-bg/70 hover:text-bg">
                  Plant care guides
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-bg/70 hover:text-bg">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-sage">
              Visit
            </h3>
            <ul className="mt-4 space-y-2 font-body text-sm text-bg/70">
              <li>142 Meadowbrook Lane</li>
              <li>Tanza, Cavite 4108</li>
              <li>hello@prairiegarden.shop</li>
              <li>Mon–Sat, 9am–6pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-bg/10 pt-6 font-body text-xs text-bg/50 sm:flex-row">
          <span>© 2026 Prairie Garden. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-bg/80">
              Privacy policy
            </Link>
            <Link href="/terms" className="hover:text-bg/80">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
