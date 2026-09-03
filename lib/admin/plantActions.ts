"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  PlantCategory,
  LightNeeds,
  PlantSize,
  CareLevel,
} from "@/lib/types";

const CATEGORIES: PlantCategory[] = [
  "Foliage",
  "Succulent & Cacti",
  "Flowering",
  "Air Plants",
  "Statement",
];
const LIGHT_NEEDS: LightNeeds[] = ["Low Light", "Bright Indirect", "Full Sun"];
const SIZES: PlantSize[] = ["Small", "Medium", "Large"];
const CARE_LEVELS: CareLevel[] = ["Easy", "Moderate", "Fussy"];

function asEnumOrNull<T extends string>(value: FormDataEntryValue | null, allowed: T[]): T | null {
  const str = typeof value === "string" ? value.trim() : "";
  return (allowed as string[]).includes(str) ? (str as T) : null;
}

function parsePlantForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceInput = String(formData.get("price") ?? "").trim();
  const stockInput = String(formData.get("stock") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const imageUrlsRaw = String(formData.get("image_urls") ?? "");

  const priceCents = Math.round(parseFloat(priceInput || "0") * 100);
  const stock = parseInt(stockInput || "0", 10);
  const imageUrls = imageUrlsRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!name) throw new Error("Name is required.");
  if (name.length > 100) throw new Error("Name must be 100 characters or fewer.");
  if (description.length > 2000) {
    throw new Error("Description must be 2000 characters or fewer.");
  }
  if (!Number.isFinite(priceCents) || priceCents < 0) {
    throw new Error("Price must be a valid, non-negative amount.");
  }
  if (!Number.isInteger(stock) || stock < 0) {
    throw new Error("Stock must be a valid, non-negative whole number.");
  }
  if (imageUrl.length > 500) {
    throw new Error("Cover photo path must be 500 characters or fewer.");
  }
  if (imageUrls.some((url) => url.length > 500)) {
    throw new Error("Each gallery photo path must be 500 characters or fewer.");
  }

  return {
    name,
    description: description || null,
    price_cents: priceCents,
    stock,
    image_url: imageUrl || imageUrls[0] || null,
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    category: asEnumOrNull(formData.get("category"), CATEGORIES),
    light_needs: asEnumOrNull(formData.get("light_needs"), LIGHT_NEEDS),
    size: asEnumOrNull(formData.get("size"), SIZES),
    care_level: asEnumOrNull(formData.get("care_level"), CARE_LEVELS),
  };
}

export async function savePlant(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const id = String(formData.get("id") ?? "").trim();

  let fields: ReturnType<typeof parsePlantForm>;
  try {
    fields = parsePlantForm(formData);
  } catch (err) {
    return { error: (err as Error).message };
  }

  // Uses the regular, session-aware client — not the service client. RLS's
  // is_admin() policy is what actually authorizes this write; the layout's
  // redirect above is only a UX nicety on top of that.
  const supabase = await createClient();

  const { error } = id
    ? await supabase.from("plants").update(fields).eq("id", id)
    : await supabase.from("plants").insert(fields);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/plants");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/plants");
}

export async function deletePlant(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("plants").delete().eq("id", id);

  if (error) {
    // Most likely cause: this plant is referenced by past order_items,
    // which the foreign key deliberately protects against deleting.
    if (error.code === "23503") {
      return {
        error:
          "Can't delete — this plant is part of an existing order. Consider setting its stock to 0 instead.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/plants");
  revalidatePath("/shop");
  revalidatePath("/");
  return { error: null };
}
