// Absolute base URL, needed for sitemap/robots entries (relative URLs
// aren't valid there). Prefers an explicit env var so a custom domain
// works without a code change; falls back to the Vercel-provided
// production host, then to the known deployment.
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost}`;

  return "https://prairie-garden.vercel.app";
}
