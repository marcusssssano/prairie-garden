import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import type { Plant } from "@/lib/types";
import DeletePlantButton from "@/components/admin/DeletePlantButton";

export default async function AdminPlantsPage() {
  const supabase = await createClient();
  const { data: plants, error } = await supabase
    .from("plants")
    .select("*")
    .order("name")
    .returns<Plant[]>();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-forest">Plants</h1>
        <Link
          href="/admin/plants/new"
          className="rounded-full bg-clay px-5 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Add plant
        </Link>
      </div>

      {error && (
        <p className="mt-6 font-body text-sm text-clay">
          Could not load plants: {error.message}
        </p>
      )}

      {!error && plants && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-forest/10">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b border-forest/10 bg-bg-soft text-xs uppercase tracking-wide text-forest/50">
                <th className="px-4 py-3 font-mono font-normal">Photo</th>
                <th className="px-4 py-3 font-mono font-normal">Name</th>
                <th className="px-4 py-3 font-mono font-normal">Category</th>
                <th className="px-4 py-3 font-mono font-normal">Price</th>
                <th className="px-4 py-3 font-mono font-normal">Stock</th>
                <th className="px-4 py-3 font-mono font-normal">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest/10">
              {plants.map((plant) => (
                <tr key={plant.id}>
                  <td className="px-4 py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-lg bg-bg-soft">
                      {plant.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={plant.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg">
                          🌿
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-forest">{plant.name}</td>
                  <td className="px-4 py-3 text-forest/70">
                    {plant.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-forest/70">
                    {formatPrice(plant.price_cents)}
                  </td>
                  <td className="px-4 py-3 font-mono text-forest/70">
                    {plant.stock <= 0 ? (
                      <span className="text-clay">0</span>
                    ) : (
                      plant.stock
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/plants/${plant.id}/edit`}
                        className="font-body text-sm text-sage-deep hover:underline"
                      >
                        Edit
                      </Link>
                      <DeletePlantButton
                        plantId={plant.id}
                        plantName={plant.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plants.length === 0 && (
            <p className="p-6 text-center font-body text-sm text-forest/60">
              No plants yet — add your first one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
