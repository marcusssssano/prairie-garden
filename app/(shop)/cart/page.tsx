"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  useCartStore,
  cartTotalCents,
  cartTotalItems,
  selectedCartItems,
  maxQuantityForItem,
  MAX_CART_TOTAL_ITEMS,
  type CartItem,
} from "@/lib/store/cart";
import { formatPrice } from "@/lib/format";
import { useIsAdmin } from "@/lib/hooks/useIsAdmin";
import ConfirmModal from "@/components/ConfirmModal";
import MelinaGuide from "@/components/MelinaGuide";

function CartLineItem({
  item,
  otherItemsTotal,
  onRequestRemove,
}: {
  item: CartItem;
  otherItemsTotal: number;
  onRequestRemove: () => void;
}) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const toggleSelected = useCartStore((state) => state.toggleSelected);
  const [quantityInput, setQuantityInput] = useState(String(item.quantity));

  const maxForThisItem = maxQuantityForItem(item.stock, otherItemsTotal);
  const atMax = item.quantity >= maxForThisItem;
  const limitedByStock = atMax && item.quantity >= item.stock;
  const limitedByCartCap = atMax && !limitedByStock;

  // Keep the text input mirrored to the store's (clamped) value —
  // covers +/- clicks and any clamping from a typed value on blur.
  useEffect(() => {
    setQuantityInput(String(item.quantity));
  }, [item.quantity]);

  function commitQuantity(raw: string) {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) {
      setQuantityInput(String(item.quantity));
      return;
    }
    updateQuantity(item.plantId, parsed);
    // Reset explicitly — if the clamped result equals the current store
    // value (e.g. typing 999 when already at the max), the quantity prop
    // never changes, so the sync effect on it wouldn't otherwise fire.
    const clamped = Math.min(
      Math.max(Math.round(parsed), 1),
      Math.max(maxForThisItem, 1)
    );
    setQuantityInput(String(clamped));
  }

  return (
    <li className="py-5">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={() => toggleSelected(item.plantId)}
          aria-label={`Select ${item.name}`}
          className="h-4 w-4 shrink-0 accent-sage-deep"
        />

        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-bg-soft">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-2xl">🌿</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <Link
            href={`/plants/${item.plantId}`}
            className="font-display text-lg text-forest hover:underline"
          >
            {item.name}
          </Link>
          <p className="mt-1 font-mono text-sm text-forest/70">
            {formatPrice(item.price_cents)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateQuantity(item.plantId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={maxForThisItem}
            value={quantityInput}
            onChange={(e) => setQuantityInput(e.target.value)}
            onBlur={(e) => commitQuantity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            aria-label={`Quantity of ${item.name}`}
            className="w-12 rounded-md border border-forest/20 bg-bg px-1 py-1 text-center font-mono text-sm text-forest [appearance:textfield] focus:border-sage-deep [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => updateQuantity(item.plantId, item.quantity + 1)}
            disabled={atMax}
            aria-label={`Increase quantity of ${item.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 text-forest/70 hover:border-sage-deep hover:text-forest disabled:cursor-not-allowed disabled:opacity-30"
          >
            +
          </button>
        </div>

        <span className="w-24 text-right font-mono text-sm text-forest">
          {formatPrice(item.price_cents * item.quantity)}
        </span>

        <button
          type="button"
          onClick={onRequestRemove}
          aria-label={`Remove ${item.name} from cart`}
          className="font-body text-sm text-forest/40 hover:text-clay"
        >
          Remove
        </button>
      </div>

      {limitedByStock && (
        <p className="mt-2 font-body text-xs text-forest/50">
          Only {item.stock} in stock.
        </p>
      )}
      {limitedByCartCap && (
        <p className="mt-2 font-body text-xs text-forest/50">
          You&apos;ve hit our {MAX_CART_TOTAL_ITEMS}-item cart limit — need a
          larger order? Get in touch and we&apos;ll take care of it directly.
        </p>
      )}
    </li>
  );
}

export default function CartPage() {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  // An admin account never adds anything to the cart (the button doesn't
  // even render for it), so the only way to land here is a stale cart
  // from before the account became admin, or a direct URL visit — either
  // way, bounce back to the dashboard rather than show a cart that was
  // never meant to be checked out.
  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setAllSelected = useCartStore((state) => state.setAllSelected);
  const totalItems = cartTotalItems(items);

  const [removeTarget, setRemoveTarget] = useState<CartItem | null>(null);
  const [confirmingBulkRemove, setConfirmingBulkRemove] = useState(false);
  const [confirmingCheckout, setConfirmingCheckout] = useState(false);

  const selectAllRef = useRef<HTMLInputElement>(null);

  const selected = selectedCartItems(items);
  const allSelected = items.length > 0 && selected.length === items.length;
  const someSelected = selected.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const subtotalCents = cartTotalCents(selected);

  function confirmBulkRemove() {
    selected.forEach((item) => removeItem(item.plantId));
    setConfirmingBulkRemove(false);
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl italic text-forest">
          Your cart is empty
        </h1>
        <div className="mt-6 flex justify-center">
          <MelinaGuide
            pose="sleeping"
            message="Nothing napping in here yet — go find a plant that fits your space."
          />
        </div>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-clay px-8 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
        >
          Browse the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 font-body text-sm text-forest/60 transition-colors hover:text-forest"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="mt-4 font-display text-3xl italic text-forest">
        Your cart
      </h1>

      <div className="mt-6 flex items-center gap-3">
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={allSelected}
          onChange={() => setAllSelected(!allSelected)}
          aria-label="Select all items"
          className="h-4 w-4 accent-sage-deep"
        />
        <span className="font-body text-sm text-forest/70">
          {allSelected
            ? "All items selected"
            : selected.length > 0
              ? `${selected.length} of ${items.length} selected`
              : "Select all"}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmingBulkRemove(true)}
            className="ml-2 font-body text-sm text-clay hover:underline"
          >
            Remove selected ({selected.length})
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start">
        <ul className="flex-1 divide-y divide-forest/10">
          {items.map((item) => (
            <CartLineItem
              key={item.plantId}
              item={item}
              otherItemsTotal={totalItems - item.quantity}
              onRequestRemove={() => setRemoveTarget(item)}
            />
          ))}
        </ul>

        <aside className="w-full rounded-2xl border border-forest/10 bg-bg-soft p-6 md:w-72">
          <h2 className="font-display text-lg text-forest">Order summary</h2>
          <div className="mt-4 flex items-center justify-between font-body text-sm text-forest/70">
            <span>Subtotal</span>
            <span className="font-mono">{formatPrice(subtotalCents)}</span>
          </div>
          {selected.length < items.length && (
            <p className="mt-1 font-body text-xs text-forest/50">
              Checking out {selected.length} of {items.length} items in your
              cart.
            </p>
          )}
          <p className="mt-1 font-body text-xs text-forest/50">
            Shipping and taxes calculated at checkout.
          </p>
          {totalItems >= MAX_CART_TOTAL_ITEMS && (
            <p className="mt-3 font-body text-xs text-clay">
              Your cart is at our {MAX_CART_TOTAL_ITEMS}-item online limit.
              For a larger order, please contact us directly.
            </p>
          )}
          {selected.length > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmingCheckout(true)}
              className="mt-5 block w-full rounded-full bg-clay px-6 py-3 text-center font-body text-sm font-medium text-white transition-colors hover:bg-sage-deep"
            >
              Checkout
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 block w-full cursor-not-allowed rounded-full bg-forest/15 px-6 py-3 text-center font-body text-sm font-medium text-forest/40"
            >
              Select items to checkout
            </button>
          )}
        </aside>
      </div>

      <ConfirmModal
        open={removeTarget !== null}
        title="Remove item?"
        message={
          removeTarget
            ? `Remove ${removeTarget.name} from your cart?`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeTarget) removeItem(removeTarget.plantId);
          setRemoveTarget(null);
        }}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmModal
        open={confirmingBulkRemove}
        title="Remove selected items?"
        message={`Remove ${selected.length} item${selected.length === 1 ? "" : "s"} from your cart?`}
        confirmLabel="Remove"
        onConfirm={confirmBulkRemove}
        onCancel={() => setConfirmingBulkRemove(false)}
      />

      <ConfirmModal
        open={confirmingCheckout}
        title="Proceed to checkout?"
        message={`You're about to check out ${selected.length} item${selected.length === 1 ? "" : "s"} for ${formatPrice(subtotalCents)}.`}
        confirmLabel="Proceed"
        onConfirm={() => {
          setConfirmingCheckout(false);
          router.push("/checkout");
        }}
        onCancel={() => setConfirmingCheckout(false)}
      />
    </main>
  );
}
