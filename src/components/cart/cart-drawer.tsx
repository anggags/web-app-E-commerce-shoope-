"use client";

import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { removeCartItemAction, updateCartItemAction } from "@/lib/actions/cart";
import { formatIDR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore, selectTotalPrice, type ClientCartLine } from "@/stores/cart-store";

export function CartDrawer({ isAuthenticated }: { isAuthenticated: boolean }) {
  const router = useRouter();
  const open = useCartStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const setLines = useCartStore((state) => state.setLines);
  const setIsAuthenticated = useCartStore((state) => state.setIsAuthenticated);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeLine = useCartStore((state) => state.removeLine);
  const clear = useCartStore((state) => state.clear);
  const lines = useCartStore((state) => state.lines);
  const total = useCartStore(selectTotalPrice);

  useEffect(() => {
    setIsAuthenticated(isAuthenticated);
  }, [isAuthenticated, setIsAuthenticated]);

  // Untuk user login, server adalah sumber kebenaran: sinkronkan store
  // setiap kali halaman di-refresh setelah mutasi.
  useEffect(() => {
    if (isAuthenticated && lines.some((line) => line.cartItemId.startsWith("guest-"))) {
      clear();
    }
  }, [isAuthenticated, lines, clear]);

  const mutation = useMutation({
    mutationFn: async (input: { cartItemId: string; quantity: number }) => {
      if (!isAuthenticated) {
        updateQuantity(input.cartItemId, input.quantity);
        return null;
      }
      return updateCartItemAction(input.cartItemId, input.quantity);
    },
    onSuccess: (summary) => {
      if (summary) {
        setLines(summary.lines as ClientCartLine[]);
        router.refresh();
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui keranjang.");
      router.refresh();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (!isAuthenticated) {
        removeLine(cartItemId);
        return null;
      }
      return removeCartItemAction(cartItemId);
    },
    onSuccess: (summary) => {
      if (summary) setLines(summary.lines as ClientCartLine[]);
      router.refresh();
    },
    onError: () => {
      toast.error("Gagal menghapus item keranjang.");
      router.refresh();
    },
  });

  const grouped = Object.values(
    lines.reduce<Record<string, { storeName: string; storeSlug: string; lines: ClientCartLine[] }>>(
      (acc, line) => {
        acc[line.store.id] ??= { storeName: line.store.name, storeSlug: line.store.slug, lines: [] };
        acc[line.store.id].lines.push(line);
        return acc;
      },
      {},
    ),
  );

  return (
    <Sheet open={open} onOpenChange={setDrawerOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Keranjang Belanja</SheetTitle>
          <SheetDescription>
            {lines.length === 0
              ? "Keranjang masih kosong."
              : `${lines.length} item dari ${grouped.length} toko`}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
              <ShoppingCart className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Belum ada produk di keranjang.</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/search">Mulai belanja</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {grouped.map((group) => (
                <section key={group.storeSlug} className="space-y-3">
                  <Link
                    href={`/stores/${group.storeSlug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {group.storeName}
                  </Link>

                  <ul className="space-y-3">
                    {group.lines.map((line) => (
                      <li key={line.cartItemId} className="flex gap-3">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                          {line.imageUrl ? (
                            <Image
                              src={line.imageUrl}
                              alt={line.productName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${line.productSlug}`}
                            className="line-clamp-2 text-sm font-medium hover:text-primary"
                            onClick={() => setDrawerOpen(false)}
                          >
                            {line.productName}
                          </Link>
                          <p className="text-xs text-muted-foreground">{line.variantName}</p>

                          {!line.isAvailable ? (
                            <p className="mt-1 text-xs font-medium text-destructive">
                              Stok tidak mencukupi
                            </p>
                          ) : null}

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center rounded-md border">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-r-none"
                                onClick={() =>
                                  mutation.mutate({
                                    cartItemId: line.cartItemId,
                                    quantity: line.quantity - 1,
                                  })
                                }
                                aria-label="Kurangi jumlah"
                              >
                                <Minus className="size-3" />
                              </Button>
                              <span className="w-8 text-center text-xs">{line.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-7 rounded-l-none"
                                onClick={() =>
                                  mutation.mutate({
                                    cartItemId: line.cartItemId,
                                    quantity: line.quantity + 1,
                                  })
                                }
                                disabled={line.quantity >= line.stock}
                                aria-label="Tambah jumlah"
                              >
                                <Plus className="size-3" />
                              </Button>
                            </div>

                            <p className="text-sm font-semibold">{formatIDR(line.subtotal)}</p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeMutation.mutate(line.cartItemId)}
                          aria-label={`Hapus ${line.productName}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>

                  <Separator />
                </section>
              ))}
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="gap-3 border-t pt-4">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="price text-lg font-bold">{formatIDR(total)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Ongkir dihitung per toko saat checkout.
          </p>
          <div className="grid w-full grid-cols-2 gap-2">
            <Button asChild variant="outline" onClick={() => setDrawerOpen(false)}>
              <Link href="/cart">Lihat keranjang</Link>
            </Button>
            <Button asChild disabled={lines.length === 0} onClick={() => setDrawerOpen(false)}>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
