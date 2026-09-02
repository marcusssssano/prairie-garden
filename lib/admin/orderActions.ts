"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = ["pending", "paid", "fulfilled", "cancelled"];

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ error: string | null }> {
  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status." };
  }

  // Regular, session-aware client — the "admins update orders" RLS policy
  // is what actually authorizes this, same defense-in-depth as the plant
  // actions.
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  return { error: null };
}
