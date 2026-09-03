"use client";

import { useActionState } from "react";
import { savePlant } from "@/lib/admin/plantActions";
import type { Plant } from "@/lib/types";

const CATEGORIES = [
  "Foliage",
  "Succulent & Cacti",
  "Flowering",
  "Air Plants",
  "Statement",
] as const;
const LIGHT_NEEDS = ["Low Light", "Bright Indirect", "Full Sun"] as const;
const SIZES = ["Small", "Medium", "Large"] as const;
const CARE_LEVELS = ["Easy", "Moderate", "Fussy"] as const;

const inputClass =
  "mt-1 w-full rounded-lg border border-forest/20 bg-bg px-3 py-2 font-body text-sm text-forest focus:border-sage-deep";

export default function PlantForm({ plant }: { plant?: Plant }) {
  const [state, formAction, isPending] = useActionState(savePlant, {
    error: null,
  });

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {plant && <input type="hidden" name="id" value={plant.id} />}

      <label className="block font-body text-sm text-forest/70">
        Name
        <input
          type="text"
          name="name"
          required
          maxLength={100}
          defaultValue={plant?.name}
          className={inputClass}
        />
      </label>

      <label className="block font-body text-sm text-forest/70">
        Description
        <textarea
          name="description"
          rows={3}
          maxLength={2000}
          defaultValue={plant?.description ?? ""}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block font-body text-sm text-forest/70">
          Price (₱)
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            required
            defaultValue={
              plant ? (plant.price_cents / 100).toFixed(2) : undefined
            }
            className={inputClass}
          />
        </label>
        <label className="block font-body text-sm text-forest/70">
          Stock
          <input
            type="number"
            name="stock"
            step="1"
            min="0"
            required
            defaultValue={plant?.stock}
            className={inputClass}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block font-body text-sm text-forest/70">
          Category
          <select
            name="category"
            defaultValue={plant?.category ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-body text-sm text-forest/70">
          Light needs
          <select
            name="light_needs"
            defaultValue={plant?.light_needs ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {LIGHT_NEEDS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-body text-sm text-forest/70">
          Size
          <select
            name="size"
            defaultValue={plant?.size ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block font-body text-sm text-forest/70">
          Care level
          <select
            name="care_level"
            defaultValue={plant?.care_level ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {CARE_LEVELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block font-body text-sm text-forest/70">
        Cover photo path
        <input
          type="text"
          name="image_url"
          maxLength={500}
          placeholder="/plants/golden-pothos-1.jpg"
          defaultValue={plant?.image_url ?? ""}
          className={inputClass}
        />
        <span className="mt-1 block font-body text-xs text-forest/50">
          Shown in the shop grid and cart. Leave blank to use the first
          gallery photo below.
        </span>
      </label>

      <label className="block font-body text-sm text-forest/70">
        Gallery photos
        <textarea
          name="image_urls"
          rows={4}
          maxLength={3000}
          placeholder={"/plants/golden-pothos-1.jpg\n/plants/golden-pothos-2.jpg"}
          defaultValue={plant?.image_urls?.join("\n") ?? ""}
          className={`${inputClass} font-mono text-xs`}
        />
        <span className="mt-1 block font-body text-xs text-forest/50">
          One path or URL per line — shown on the plant&apos;s detail page.
        </span>
      </label>

      {state.error && (
        <p className="font-body text-sm text-clay" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-clay px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Saving…" : plant ? "Save changes" : "Add plant"}
      </button>
    </form>
  );
}
