"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LAST_SHOP_URL_KEY } from "@/lib/shopUrl";

// Renders nothing — just records the current /shop URL (with filters) so
// the header's "Shop" link and the plant detail page's "Back to shop"
// link can return here instead of resetting to an unfiltered grid.
export default function ShopUrlTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    sessionStorage.setItem(
      LAST_SHOP_URL_KEY,
      query ? `${pathname}?${query}` : pathname
    );
  }, [pathname, searchParams]);

  return null;
}
