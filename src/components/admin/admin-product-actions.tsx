"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

import { moderateProductAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import type { ProductStatus } from "@/generated/prisma/enums";

export function AdminProductActions({
  productId,
  status,
}: {
  productId: string;
  status: ProductStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function moderate(action: "approve" | "reject") {
    if (action === "reject" && !window.confirm("Tolak produk ini?")) return;

    startTransition(async () => {
      try {
        await moderateProductAction(productId, action);
        toast.success(action === "approve" ? "Produk disetujui dan tayang." : "Produk ditolak.");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  if (status === "PENDING_REVIEW") {
    return (
      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={() => moderate("approve")}>
          <Check className="size-4" /> Setujui
        </Button>
        <Button size="sm" variant="destructive" disabled={isPending} onClick={() => moderate("reject")}>
          <X className="size-4" /> Tolak
        </Button>
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Button size="sm" variant="outline" disabled={isPending} onClick={() => moderate("reject")}>
        <X className="size-4" /> Tarik dari tayang
      </Button>
    );
  }

  return <span className="text-xs text-muted-foreground">Tidak perlu tindakan</span>;
}