"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { PlantCategory, LightNeeds, PlantSize } from "@/lib/types";

const CATEGORIES: PlantCategory[] = [
  "Foliage",
  "Succulent & Cacti",
  "Flowering",
  "Air Plants",
  "Statement",
];

const LIGHT_NEEDS: LightNeeds[] = ["Low Light", "Bright Indirect", "Full Sun"];

const SIZES: PlantSize[] = ["Small", "Medium", "Large"];

function FilterGroup({
  label,
  paramKey,
  options,
  active,
  onToggle,
}: {
  label: string;
  paramKey: string;
  options: string[];
  active: string | null;
  onToggle: (paramKey: string, value: string) => void;
}) {
  return (
    <div>
      <span className="font-mono text-[11px] uppercase tracking-wide text-forest/50">
        {label}
      </span>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = active === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(paramKey, option)}
              className={`rounded-full border px-3 py-1.5 font-body text-sm transition-colors ${
                isActive
                  ? "border-sage-deep bg-sage-deep text-white"
                  : "border-forest/15 bg-bg text-forest/70 hover:border-sage-deep hover:text-forest"
              }`}
              aria-pressed={isActive}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category");
  const light = searchParams.get("light");
  const size = searchParams.get("size");

  function toggle(paramKey: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(paramKey) === value) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasActiveFilters = category || light || size;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-forest/10 bg-bg-soft p-5 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-col gap-5 md:flex-row md:gap-8">
        <FilterGroup
          label="Category"
          paramKey="category"
          options={CATEGORIES}
          active={category}
          onToggle={toggle}
        />
        <FilterGroup
          label="Light"
          paramKey="light"
          options={LIGHT_NEEDS}
          active={light}
          onToggle={toggle}
        />
        <FilterGroup
          label="Size"
          paramKey="size"
          options={SIZES}
          active={size}
          onToggle={toggle}
        />
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => router.push(pathname, { scroll: false })}
          className="self-start font-body text-sm text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
