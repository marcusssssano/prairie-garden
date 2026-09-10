"use client";

import { useEffect, useState } from "react";
import type { Plant } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import {
  useCartStore,
  cartTotalItems,
  maxQuantityForItem,
} from "@/lib/store/cart";

// Mounted only while open (see PlantCard) — so it always starts fresh at
// quantity 1 without an effect resetting state on the way in.
export default function AddToCartModal({
  plant,
  onClose,
}: {
  plant: Plant;
  onClose: () => void;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const quantityInCart = useCartStore(
    (state) => state.items.find((i) => i.plantId === plant.id)?.quantity ?? 0
  );
  const otherItemsTotal = useCartStore((state) =>
    cartTotalItems(state.items.filter((i) => i.plantId !== plant.id))
  );
  const roomLeft = Math.max(
    maxQuantityForItem(plant.stock, otherItemsTotal) - quantityInCart,
    0
  );

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleConfirm() {
    addItem(
      {
        plantId: plant.id,
        name: plant.name,
        price_cents: plant.price_cents,
        image_url: plant.image_url,
        stock: plant.stock,
      },
      quantity
    );
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-cart-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-bg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="add-to-cart-title" className="font-display text-xl text-forest">
          Add to cart
        </h2>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-bg-soft">
            {plant.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={plant.image_url}
                alt={plant.name}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">
                🌿
              </div>
            )}
          </div>
          <div>
            <p className="font-display text-base text-forest">{plant.name}</p>
            <p className="font-mono text-sm text-forest/70">
              {formatPrice(plant.price_cents)}
              {plant.size && (
                <span className="ml-2 font-body text-xs text-forest/50">
                  {plant.size} size
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="font-body text-sm text-forest/70">Quantity</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              −
            </button>
            <span className="w-6 text-center font-mono text-sm text-forest">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(roomLeft, q + 1))}
              disabled={quantity >= roomLeft}
              aria-label="Increase quantity"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
        {roomLeft <= 0 && (
          <p className="mt-2 font-body text-xs text-clay">
            You&apos;ve already added all available stock to your cart.
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-forest/10 pt-4 font-body text-sm font-medium text-forest">
          <span>Subtotal</span>
          <span className="font-mono">
            {formatPrice(plant.price_cents * quantity)}
          </span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-forest/20 px-4 py-2 font-body text-sm text-forest/70 transition-colors hover:border-forest/40 hover:text-forest"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={roomLeft <= 0}
            className="rounded-full bg-clay px-4 py-2 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
