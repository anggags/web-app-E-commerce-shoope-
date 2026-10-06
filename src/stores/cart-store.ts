"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ClientCartLine = {
  cartItemId: string;
  productId: string;
  productSlug: string;
  variantId: string;
  productName: string;
  variantName: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
  isAvailable: boolean;
  store: { id: string; name: string; slug: string };
};

type CartState = {
  lines: ClientCartLine[];
  isDrawerOpen: boolean;
  isAuthenticated: boolean;
  setLines: (lines: ClientCartLine[]) => void;
  setIsAuthenticated: (value: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  /** Dipakai keranjang guest (localStorage) sebelum user login. */
  addGuestLine: (line: ClientCartLine) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeLine: (cartItemId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isDrawerOpen: false,
      isAuthenticated: false,
      setLines: (lines) => set({ lines }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      setDrawerOpen: (open) => set({ isDrawerOpen: open }),
      addGuestLine: (line) =>
        set((state) => {
          const existing = state.lines.find((item) => item.variantId === line.variantId);
          if (!existing) return { lines: [...state.lines, line] };

          return {
            lines: state.lines.map((item) =>
              item.variantId === line.variantId
                ? {
                    ...item,
                    quantity: Math.min(item.quantity + line.quantity, item.stock),
                    subtotal: item.price * Math.min(item.quantity + line.quantity, item.stock),
                  }
                : item,
            ),
          };
        }),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((item) => item.cartItemId !== cartItemId)
              : state.lines.map((item) =>
                  item.cartItemId === cartItemId
                    ? {
                        ...item,
                        quantity,
                        subtotal: item.price * quantity,
                        isAvailable: quantity <= item.stock,
                      }
                    : item,
                ),
        })),
      removeLine: (cartItemId) =>
        set((state) => ({
          lines: state.lines.filter((item) => item.cartItemId !== cartItemId),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "marketplace-cart",
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function selectTotalItems(state: CartState) {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function selectTotalPrice(state: CartState) {
  return state.lines.reduce((sum, line) => sum + line.subtotal, 0);
}
