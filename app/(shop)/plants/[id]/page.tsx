import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { getMelinaCareTip } from "@/lib/melinaTips";
import type { Plant } from "@/lib/types";
import AddToCartControl from "@/components/AddToCartControl";
import MelinaGuide from "@/components/MelinaGuide";
import BackToShopLink from "@/components/BackToShopLink";
import PlantGallery from "@/components/PlantGallery";

function DetailTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-forest/10 bg-bg-soft px-4 py-3">
      <span className="block font-mono text-[10px] uppercase tracking-wide text-forest/50">
        {label}
      </span>
      <span className="mt-1 block font-body text-sm text-forest">
        {value}
      </span>
    </div>
  );
}

// Shared links should show the plant, not the generic site title. Falls
// back rather than throwing — a missing plant is handled by the page's
// own notFound() below, and metadata shouldn't be what breaks first.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plant } = await supabase
    .from("plants")
    .select("name, description")
    .eq("id", id)
    .maybeSingle<Pick<Plant, "name" | "description">>();

  if (!plant) return { title: "Plant not found — Prairie Garden" };

  return {
    title: `${plant.name} — Prairie Garden`,
    description:
      plant.description ??
      `${plant.name}, available from Prairie Garden.`,
  };
}

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plant } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .maybeSingle<Plant>();

  if (!plant) {
    notFound();
  }

  const outOfStock = plant.stock <= 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-6">
        <BackToShopLink />
      </div>
      <div className="grid gap-10 md:grid-cols-2">
        <PlantGallery
          images={plant.image_urls ?? (plant.image_url ? [plant.image_url] : [])}
          alt={plant.name}
          categoryLabel={plant.category}
          outOfStock={outOfStock}
        />

        <div className="flex flex-col">
          <h1 className="font-display text-3xl italic text-forest md:text-4xl">
            {plant.name}
          </h1>
          <p className="mt-2 font-mono text-lg text-forest/80">
            {formatPrice(plant.price_cents)}
          </p>

          {plant.description && (
            <p className="mt-5 font-body text-base leading-relaxed text-forest/80">
              {plant.description}
            </p>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {plant.light_needs && (
              <DetailTag label="Light" value={plant.light_needs} />
            )}
            {plant.size && <DetailTag label="Size" value={plant.size} />}
            {plant.care_level && (
              <DetailTag label="Care" value={plant.care_level} />
            )}
          </div>

          <p className="mt-6 font-body text-xs text-forest/50">
            {outOfStock
              ? "Currently out of stock."
              : plant.stock <= 5
                ? `Only ${plant.stock} left in stock.`
                : "In stock."}
          </p>

          <div className="mt-4">
            <AddToCartControl plant={plant} />
          </div>

          <div className="mt-6">
            <MelinaGuide
              pose="pointing"
              message={getMelinaCareTip(plant.care_level, plant.light_needs)}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
