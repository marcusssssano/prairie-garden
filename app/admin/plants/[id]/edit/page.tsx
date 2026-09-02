import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plant } from "@/lib/types";
import PlantForm from "@/components/admin/PlantForm";

export default async function EditPlantPage({
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

  return (
    <div>
      <h1 className="font-display text-2xl italic text-forest">
        Edit {plant.name}
      </h1>
      <div className="mt-6">
        <PlantForm plant={plant} />
      </div>
    </div>
  );
}
