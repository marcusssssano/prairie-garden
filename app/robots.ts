import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

// Keeps crawlers out of anything personal or transactional. These paths
// are all access-controlled anyway (RLS, the admin guard, the guest-order
// email check) — this just stops them being crawled and indexed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/account/",
        "/order-confirmation/",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
