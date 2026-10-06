"use client";

import { useEffect } from "react";

import { useCartStore, type ClientCartLine } from "@/stores/cart-store";

type Props = {
  isAuthenticated: boolean;
  lines: ClientCartLine[];
};

/**
 * Sinkronkan keranjang dari server ke Zustand store.
 * Saat user login, baris keranjang guest dibuang karena server jadi sumber kebenaran.
 */
export function CartStoreSync({ isAuthenticated, lines }: Props) {
  const setLines = useCartStore((state) => state.setLines);
  const setIsAuthenticated = useCartStore((state) => state.setIsAuthenticated);

  useEffect(() => {
    setIsAuthenticated(isAuthenticated);
  }, [isAuthenticated, setIsAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setLines(lines);
    }
  }, [isAuthenticated, lines, setLines]);

  return null;
}
