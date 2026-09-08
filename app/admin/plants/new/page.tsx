import Link from "next/link";
import PlantForm from "@/components/admin/PlantForm";

export default function NewPlantPage() {
  return (
    <div>
      <Link
        href="/admin/plants"
        className="font-body text-sm text-forest/60 transition-colors hover:text-forest"
      >
        ← Back to plants
      </Link>
      <h1 className="mt-2 font-display text-2xl italic text-forest">
        Add plant
      </h1>
      <div className="mt-6">
        <PlantForm />
      </div>
    </div>
  );
}
