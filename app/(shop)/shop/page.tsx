import { createClient } from "@/lib/supabase/server";
import PlantCard from "@/components/PlantCard";
import FilterBar from "@/components/FilterBar";
import MelinaGuide from "@/components/MelinaGuide";
import ShopUrlTracker from "@/components/ShopUrlTracker";
import type { Plant } from "@/lib/types";

export const metadata = {
  title: "Shop all plants — Prairie Garden",
  description:
    "Browse every plant in the Prairie Garden collection — filter by category, light needs, and size.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; light?: string; size?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("plants").select("*").order("name");

  if (params.category) {
    query = query.eq("category", params.category);
  }
  if (params.light) {
    query = query.eq("light_needs", params.light);
  }
  if (params.size) {
    query = query.eq("size", params.size);
  }

  const { data: plants, error } = await query.returns<Plant[]>();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <ShopUrlTracker />
      <div className="mb-10 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-sage-deep">
          Shop
        </span>
        <h1 className="mt-2 font-display text-3xl italic text-forest md:text-4xl">
          Find your next plant
        </h1>
      </div>

      <div className="mb-10">
        <FilterBar />
      </div>

      {error && (
        <p className="font-body text-sm text-clay">
          Something went wrong loading the shop. Please try again shortly.
        </p>
      )}

      {!error && plants && plants.length === 0 && (
        <div className="flex justify-center py-12">
          <MelinaGuide
            pose="thinking"
            message="Hmm, nothing matches those filters — try clearing one and I'll help you look again."
          />
        </div>
      )}

      {!error && plants && plants.length > 0 && (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      )}
    </main>
  );
}
