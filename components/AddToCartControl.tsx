"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plant } from "@/lib/types";
import {
  useCartStore,
  cartTotalItems,
  maxQuantityForItem,
} from "@/lib/store/cart";
import { setBuyNowItem } from "@/lib/buyNow";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/hooks/useAuth";
import ConfirmModal from "@/components/ConfirmModal";

export default function AddToCartControl({ plant }: { plant: Plant }) {
  const router = useRouter();
  const { isAdmin } = useAuth();
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

  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [confirmingBuyNow, setConfirmingBuyNow] = useState(false);

  // Clamped during render rather than synced back through an effect —
  // roomLeft can shrink while this is on screen (stock edited in admin,
  // the same plant added from another tab), and deriving keeps the shown
  // quantity valid without the extra render pass an effect would cost.
  const quantity = Math.min(
    Math.max(requestedQuantity, 1),
    Math.max(roomLeft, 1)
  );

  function addToCart() {
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
  }

  function handleAddToCart() {
    addToCart();
    setJustAdded(true);
    setRequestedQuantity(1);
    setTimeout(() => setJustAdded(false), 1500);
  }

  // Deliberately does NOT touch the shared cart — checking out "this one
  // plant, this quantity" should never pull in whatever else happens to
  // already be sitting (and selected) in the cart. The checkout page
  // reads this back as a one-time, standalone purchase.
  function confirmBuyNow() {
    setBuyNowItem({
      plantId: plant.id,
      name: plant.name,
      price_cents: plant.price_cents,
      image_url: plant.image_url,
      stock: plant.stock,
      quantity,
    });
    setConfirmingBuyNow(false);
    router.push("/checkout");
  }

  // An admin account manages the store, it doesn't buy from it — no
  // quantity picker or purchase buttons to get in the way.
  if (isAdmin) {
    return null;
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setRequestedQuantity(Math.max(1, quantity - 1))}
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
            setRequestedQuantity(Math.min(Math.max(parsed, 1), roomLeft));
          }}
          aria-label="Quantity"
          className="w-14 rounded-md border border-forest/20 bg-bg px-1 py-1.5 text-center font-mono text-sm text-forest [appearance:textfield] focus:border-sage-deep [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => setRequestedQuantity(Math.min(roomLeft, quantity + 1))}
          disabled={quantity >= roomLeft}
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 rounded-full border border-sage-deep px-6 py-3 font-body text-sm font-medium text-sage-deep transition-colors hover:bg-sage-deep hover:text-white"
        >
          {justAdded ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmingBuyNow(true)}
          className="flex-1 rounded-full bg-clay px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Buy now
        </button>
      </div>

      <ConfirmModal
        open={confirmingBuyNow}
        title="Proceed to checkout?"
        message={`You're about to check out ${quantity} × ${plant.name} for ${formatPrice(plant.price_cents * quantity)}.`}
        confirmLabel="Proceed"
        onConfirm={confirmBuyNow}
        onCancel={() => setConfirmingBuyNow(false)}
      />
    </div>
  );
}
