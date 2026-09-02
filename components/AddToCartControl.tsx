"use client";

import { useEffect, useState } from "react";
import type { Plant } from "@/lib/types";
import {
  useCartStore,
  cartTotalItems,
  maxQuantityForItem,
} from "@/lib/store/cart";

export default function AddToCartControl({ plant }: { plant: Plant }) {
  const outOfStock = plant.stock <= 0;
  const addItem = useCartStore((state) => state.addItem);
  const quantityInCart = useCartStore(
    (state) => state.items.find((i) => i.plantId === plant.id)?.quantity ?? 0
  );
  const otherItemsTotal = useCartStore((state) =>
    cartTotalItems(state.items.filter((i) => i.plantId !== plant.id))
  );
  const maxForThisPlant = maxQuantityForItem(plant.stock, otherItemsTotal);
  const roomLeft = Math.max(maxForThisPlant - quantityInCart, 0);
  const atMax = roomLeft <= 0;

  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(q, 1), Math.max(roomLeft, 1)));
  }, [roomLeft]);

  function handleAddToCart() {
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
    setJustAdded(true);
    setQuantity(1);
    setTimeout(() => setJustAdded(false), 1500);
  }

  if (outOfStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-full border border-forest/15 px-6 py-3 font-body text-sm text-forest/30"
      >
        Sold out
      </button>
    );
  }

  if (atMax) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-full border border-forest/15 px-6 py-3 font-body text-sm text-forest/30"
      >
        {quantityInCart >= plant.stock
          ? "All available in your cart"
          : "Cart limit reached"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={roomLeft}
          value={quantity}
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            if (Number.isNaN(parsed)) return;
            setQuantity(Math.min(Math.max(parsed, 1), roomLeft));
          }}
          aria-label="Quantity"
          className="w-14 rounded-md border border-forest/20 bg-bg px-1 py-1.5 text-center font-mono text-sm text-forest [appearance:textfield] focus:border-sage-deep [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(roomLeft, q + 1))}
          disabled={quantity >= roomLeft}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        className="flex-1 rounded-full bg-clay px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
      >
        {justAdded ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
