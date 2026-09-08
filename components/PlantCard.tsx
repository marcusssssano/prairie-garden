"use client";

import Link from "next/link";
import { useState } from "react";
import type { Plant } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { useCartStore, cartTotalItems, maxQuantityForItem } from "@/lib/store/cart";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import AddToCartModal from "@/components/AddToCartModal";

// Shown in place of a photo until we have real product images.
function LeafPlaceholder() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect width="200" height="200" fill="#F7F8F4" />
      <path
        d="M100 160 C100 110, 60 90, 45 45 C95 55, 115 90, 115 130 C115 145, 108 155, 100 160 Z"
        fill="#A4B089"
      />
      <path
        d="M100 160 C100 105, 145 85, 160 40 C110 50, 90 85, 90 125 C90 142, 95 153, 100 160 Z"
        fill="#6B7A54"
      />
      <path
        d="M100 160 L100 60"
        stroke="#3D4A31"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

export default function PlantCard({ plant }: { plant: Plant }) {
  const outOfStock = plant.stock <= 0;
  const quantityInCart = useCartStore(
    (state) => state.items.find((i) => i.plantId === plant.id)?.quantity ?? 0
  );
  const otherItemsTotal = useCartStore((state) =>
    cartTotalItems(state.items.filter((i) => i.plantId !== plant.id))
  );
  const maxForThisPlant = maxQuantityForItem(plant.stock, otherItemsTotal);
  const atMax = quantityInCart >= maxForThisPlant;
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = useIsAdmin();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  }

  return (
    <>
      <Link
        href={`/plants/${plant.id}`}
        className="group block overflow-hidden rounded-2xl border border-forest/10 bg-bg transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-square overflow-hidden bg-bg-soft">
          {plant.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={plant.image_url}
              alt={plant.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <LeafPlaceholder />
          )}
          {plant.category && (
            <span className="absolute left-3 top-3 rounded-full bg-bg/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-sage-deep">
              {plant.category}
            </span>
          )}
          {outOfStock && (
            <span className="absolute right-3 top-3 rounded-full bg-forest/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white">
              Sold out
            </span>
          )}
        </div>
        <div className="px-4 py-3">
          <h3 className="font-display text-lg text-forest">{plant.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-sm text-forest/70">
              {formatPrice(plant.price_cents)}
            </span>
            {plant.care_level && (
              <span className="font-body text-xs text-forest/50">
                {plant.care_level} care
              </span>
            )}
          </div>
          {!isAdmin && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || atMax}
              className="mt-3 w-full rounded-full border border-sage-deep px-3 py-1.5 font-body text-sm text-sage-deep transition-colors hover:bg-sage-deep hover:text-white disabled:cursor-not-allowed disabled:border-forest/15 disabled:text-forest/30 disabled:hover:bg-transparent"
            >
              {outOfStock
                ? "Sold out"
                : atMax
                  ? quantityInCart >= plant.stock
                    ? "All available in your cart"
                    : "Cart limit reached"
                  : "Add to cart"}
            </button>
          )}
        </div>
      </Link>

      {!isAdmin && (
        <AddToCartModal
          plant={plant}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
