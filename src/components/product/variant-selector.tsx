"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { addToCartAction } from "@/lib/actions/cart";
import { calculateDiscountPercent, formatIDR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCartStore, type ClientCartLine } from "@/stores/cart-store";

export type SelectorVariant = {
  id: string;
  name: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
};

export type VariantSelectorProps = {
  productSlug: string;
  productName: string;
  productId: string;
  imageUrl: string | null;
  optionNames: string[];
  variants: SelectorVariant[];
  isAuthenticated: boolean;
  store: { id: string; name: string; slug: string };
};

export function VariantSelector({
  productSlug,
  productName,
  productId,
  imageUrl,
  optionNames,
  variants,
  isAuthenticated,
  store,
}: VariantSelectorProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = variants.find((variant) => variant.stock > 0) ?? variants[0];
    return first ? { ...first.options } : {};
  });
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();

  const addGuestLine = useCartStore((state) => state.addGuestLine);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const setLines = useCartStore((state) => state.setLines);
  const setIsAuthenticated = useCartStore((state) => state.setIsAuthenticated);

  useEffect(() => {
    setIsAuthenticated(isAuthenticated);
  }, [isAuthenticated, setIsAuthenticated]);

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) =>
        optionNames.every((name) => (variant.options[name] ?? "") === (selected[name] ?? "")),
      ) ?? null,
    [optionNames, selected, variants],
  );

  const valueOptions = useMemo(() => {
    return optionNames.map((name) => ({
      name,
      values: [...new Set(variants.map((variant) => variant.options[name]).filter(Boolean))],
    }));
  }, [optionNames, variants]);

  const maxQuantity = Math.min(selectedVariant?.stock ?? 0, 99);
  const discount = selectedVariant
    ? calculateDiscountPercent(selectedVariant.price, selectedVariant.compareAtPrice)
    : null;

  function handleAddToCart() {
    if (!selectedVariant) {
      toast.error("Pilih variasi produk terlebih dahulu.");
      return;
    }
    if (selectedVariant.stock === 0) {
      toast.error("Stok variasi ini habis.");
      return;
    }

    if (!isAuthenticated) {
      addGuestLine({
        cartItemId: `guest-${selectedVariant.id}`,
        productId,
        productSlug,
        variantId: selectedVariant.id,
        productName,
        variantName: selectedVariant.name,
        imageUrl,
        price: selectedVariant.price,
        quantity,
        subtotal: selectedVariant.price * quantity,
        stock: selectedVariant.stock,
        isAvailable: true,
        store,
      });
      toast.success("Masuk ke keranjang", {
        description: "Keranjang disimpan di perangkat ini sampai kamu login.",
      });
      openDrawer();
      return;
    }

    startTransition(async () => {
      try {
        const summary = await addToCartAction(selectedVariant.id, quantity);
        setLines(summary.lines as ClientCartLine[]);
        toast.success("Masuk ke keranjang", { description: productName });
        openDrawer();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal menambah ke keranjang.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-3">
        <p className="price text-3xl font-bold">
          {formatIDR(selectedVariant?.price ?? 0)}
        </p>
        {selectedVariant?.compareAtPrice &&
        selectedVariant.compareAtPrice > selectedVariant.price ? (
          <>
            <p className="text-base text-muted-foreground line-through">
              {formatIDR(selectedVariant.compareAtPrice)}
            </p>
            {discount ? <Badge variant="destructive">-{discount}%</Badge> : null}
          </>
        ) : null}
      </div>

      {valueOptions.map((option) => (
        <div key={option.name}>
          <p className="mb-2 text-sm font-medium">
            {option.name}
            <span className="ml-2 text-muted-foreground">{selected[option.name]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isActive = selected[option.name] === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      <Separator />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-r-none"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1}
            aria-label="Kurangi jumlah"
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-l-none"
            onClick={() => setQuantity((value) => Math.min(maxQuantity || 1, value + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Tambah jumlah"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground">
          {selectedVariant
            ? selectedVariant.stock > 0
              ? `Stok ${selectedVariant.stock}`
              : "Stok habis"
            : "Varian tidak tersedia"}
        </span>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={isPending || !selectedVariant || selectedVariant.stock === 0}
      >
        <ShoppingCart className="size-4" />
        {isPending ? "Menambahkan..." : "Masuk Keranjang"}
      </Button>
    </div>
  );
}
