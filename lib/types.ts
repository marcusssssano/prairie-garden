export type PlantCategory =
  | "Foliage"
  | "Succulent & Cacti"
  | "Flowering"
  | "Air Plants"
  | "Statement";

export type LightNeeds = "Low Light" | "Bright Indirect" | "Full Sun";

export type PlantSize = "Small" | "Medium" | "Large";

export type CareLevel = "Easy" | "Moderate" | "Fussy";

export type Plant = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
  image_url: string | null;
  image_urls: string[] | null;
  category: PlantCategory | null;
  light_needs: LightNeeds | null;
  size: PlantSize | null;
  care_level: CareLevel | null;
  created_at: string;
};
