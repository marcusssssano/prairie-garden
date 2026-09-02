import PlantForm from "@/components/admin/PlantForm";

export default function NewPlantPage() {
  return (
    <div>
      <h1 className="font-display text-2xl italic text-forest">Add plant</h1>
      <div className="mt-6">
        <PlantForm />
      </div>
    </div>
  );
}
