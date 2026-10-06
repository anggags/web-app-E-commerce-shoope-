"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ExternalLink, Pencil, Send } from "lucide-react";
import { toast } from "sonner";

import {
  archiveProductAction,
  submitProductForReviewAction,
} from "@/lib/actions/product";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/generated/prisma/enums";

export function ProductRowActions({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<unknown> | void, successMessage: string) {
    startTransition(async () => {
      try {
        await action();
        toast.success(successMessage);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {status === "DRAFT" || status === "REJECTED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => run(() => submitProductForReviewAction(productId), "Dikirim untuk moderasi")}
        >
          <Send className="size-3.5" /> Ajukan
        </Button>
      ) : null}

      {status !== "ARCHIVED" ? (
        <>
          <Button asChild size="icon" variant="ghost" className="size-8" aria-label="Ubah produk">
            <Link href={`/seller/products/${productId}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-destructive"
            disabled={isPending}
            onClick={() => run(() => archiveProductAction(productId), "Produk diarsipkan")}
            aria-label="Arsipkan produk"
          >
            <Archive className="size-4" />
          </Button>
        </>
      ) : (
        <ExternalLink className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}
