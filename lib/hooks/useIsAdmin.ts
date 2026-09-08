"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Shared by every client component that needs to hide or block shopping
// actions for admin accounts (SiteHeader, PlantCard, AddToCartControl,
// the cart/checkout pages) — one place for the "is this user an admin"
// check instead of duplicating the same profiles lookup everywhere.
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadAdminFlag(userId: string | undefined) {
      if (!userId) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle();
      setIsAdmin(data?.is_admin ?? false);
    }

    supabase.auth.getUser().then(({ data }) => {
      loadAdminFlag(data.user?.id);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadAdminFlag(session?.user?.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  return isAdmin;
}
