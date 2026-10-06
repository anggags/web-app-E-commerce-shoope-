"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { removeCartItemAction, updateCartItemAction } from "@/lib/actions/cart";
import { Button } from "@/components/ui/button";

export function CartLineControls({
  cartItemId,
  quantity,
  stock,
  isAuthenticated,
}: {
  cartItemId: string;
  quantity: number;
  stock: number;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown> | void) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-md border">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-r-none"
          disabled={isPending || quantity <= 1}
          onClick={() =>
            run(() =>
              isAuthenticated
                ? updateCartItemAction(cartItemId, quantity - 1)
                : undefined,
            )
          }
          aria-label="Kurangi jumlah"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="w-9 text-center text-sm">{quantity}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-l-none"
          disabled={isPending || quantity >= stock}
          onClick={() =>
            run(() =>
              isAuthenticated ? updateCartItemAction(cartItemId, quantity + 1) : undefined,
            )
          }
          aria-label="Tambah jumlah"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        disabled={isPending}
        onClick={() => run(() => (isAuthenticated ? removeCartItemAction(cartItemId) : undefined))}
        aria-label="Hapus item"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
