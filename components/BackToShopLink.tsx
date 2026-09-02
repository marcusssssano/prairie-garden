"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_SHOP_URL_KEY } from "@/lib/shopUrl";

// Returns to wherever you were in the shop (filters intact) rather than
// resetting to a bare, unfiltered /shop — falls back to plain /shop if
// you arrived here without ever having visited the shop this session
// (e.g. straight from the homepage's "Featured this week").
export default function BackToShopLink() {
  const [href, setHref] = useState("/shop");

  useEffect(() => {
    const stored = sessionStorage.getItem(LAST_SHOP_URL_KEY);
    if (stored) setHref(stored);
  }, []);

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-body text-sm text-forest/60 transition-colors hover:text-forest"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Back to shop
    </Link>
  );
}
