"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore, selectTotalItems } from "@/stores/cart-store";

export function CartButton() {
  const openDrawer = useCartStore((state) => state.openDrawer);
  const totalItems = useCartStore(selectTotalItems);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={openDrawer}
      className="relative"
      aria-label={`Buka keranjang, ${totalItems} item`}
    >
      <ShoppingCart className="size-5" />
      {totalItems > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      ) : null}
    </Button>
  );
}

export function CartPageLink({ className }: { className?: string }) {
  return (
    <Button asChild variant="outline" size="sm" className={className}>
      <Link href="/cart">Keranjang</Link>
    </Button>
  );
}
