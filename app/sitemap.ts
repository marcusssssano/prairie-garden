import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/siteUrl";

// Regenerated hourly rather than at build time, so plants added through
// the admin dashboard show up without needing a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: now, priority: 0.9 },
    { url: `${baseUrl}/care-guides`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/shipping-returns`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, priority: 0.5 },
  ];

  // A sitemap is a nice-to-have — if the database is unreachable, still
  // serve the static routes rather than failing the whole response.
  try {
    const supabase = await createClient();
    const { data: plants } = await supabase
      .from("plants")
      .select("id, created_at")
      .returns<{ id: string; created_at: string }[]>();

    const plantRoutes: MetadataRoute.Sitemap = (plants ?? []).map((plant) => ({
      url: `${baseUrl}/plants/${plant.id}`,
      lastModified: new Date(plant.created_at),
      priority: 0.8,
    }));

    return [...staticRoutes, ...plantRoutes];
  } catch {
    return staticRoutes;
  }
}
