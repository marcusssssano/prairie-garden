import { createBrowserClient } from "@supabase/ssr";

// Use this client in Client Components ("use client" files) —
// e.g. cart interactions, login form, live product filters.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
