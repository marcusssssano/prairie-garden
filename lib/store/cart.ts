import { create } from "zustand";
import { persist } from "zustand/middleware";

// Total items (summed across every line) allowed in one online cart.
// Above this, an order needs to go through us directly rather than the
// automated checkout — see the note shown in the cart UI. Per-item quantity
// isn't separately capped beyond this — it's just bounded by that plant's
// stock, snapshotted onto the line when it's added.
export const MAX_CART_TOTAL_ITEMS = 100;

export type CartItem = {
  plantId: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  stock: number;
  quantity: number;
  // Whether this line is included in bulk-remove / checkout. Lives here
  // (not local component state) so both the cart page and the checkout
  // page agree on which lines are "in".
  selected: boolean;
};

type CartState = {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity" | "selected">,
    quantity?: number
  ) => void;
  removeItem: (plantId: string) => void;
  updateQuantity: (plantId: string, quantity: number) => void;
  toggleSelected: (plantId: string) => void;
  setAllSelected: (selected: boolean) => void;
  clear: () => void;
};

// The highest quantity a line can take: bounded by that plant's stock and
// by whatever total-cart headroom remains once every other line is counted.
export function maxQuantityForItem(
  stock: number,
  otherItemsTotal: number
) {
  return Math.max(
    0,
    Math.min(stock, MAX_CART_TOTAL_ITEMS - otherItemsTotal)
  );
}

function clampQuantity(quantity: number, stock: number, otherItemsTotal: number) {
  const max = maxQuantityForItem(stock, otherItemsTotal);
  return Math.min(Math.max(Math.round(quantity), max > 0 ? 1 : 0), max);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.plantId === item.plantId);
          const otherItemsTotal = state.items
            .filter((i) => i.plantId !== item.plantId)
            .reduce((sum, i) => sum + i.quantity, 0);

          if (existing) {
            const newQuantity = clampQuantity(
              existing.quantity + quantity,
              existing.stock,
              otherItemsTotal
            );
            return {
              items: state.items.map((i) =>
                i.plantId === item.plantId ? { ...i, quantity: newQuantity } : i
              ),
            };
          }

          const newQuantity = clampQuantity(quantity, item.stock, otherItemsTotal);
          if (newQuantity <= 0) return state;
          return {
            items: [
              ...state.items,
              { ...item, quantity: newQuantity, selected: true },
            ],
          };
        }),
      removeItem: (plantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.plantId !== plantId),
        })),
      updateQuantity: (plantId, quantity) =>
        set((state) => {
          const target = state.items.find((i) => i.plantId === plantId);
          if (!target) return state;
          const otherItemsTotal = state.items
            .filter((i) => i.plantId !== plantId)
            .reduce((sum, i) => sum + i.quantity, 0);
          const newQuantity = clampQuantity(quantity, target.stock, otherItemsTotal);
          if (newQuantity <= 0) {
            return { items: state.items.filter((i) => i.plantId !== plantId) };
          }
          return {
            items: state.items.map((i) =>
              i.plantId === plantId ? { ...i, quantity: newQuantity } : i
            ),
          };
        }),
      toggleSelected: (plantId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.plantId === plantId ? { ...i, selected: !i.selected } : i
          ),
        })),
      setAllSelected: (selected) =>
        set((state) => ({
          items: state.items.map((i) => ({ ...i, selected })),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "prairie-garden-cart" }
  )
);

export function cartTotalItems(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotalCents(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
}

export function selectedCartItems(items: CartItem[]) {
  return items.filter((i) => i.selected);
}
