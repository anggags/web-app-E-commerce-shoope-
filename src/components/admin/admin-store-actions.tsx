"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setStoreStatusAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import type { StoreStatus } from "@/generated/prisma/enums";

export function AdminStoreActions({
  storeId,
  status,
}: {
  storeId: string;
  status: StoreStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function update(nextStatus: StoreStatus, message: string) {
    startTransition(async () => {
      try {
        await setStoreStatusAction(storeId, nextStatus);
        toast.success(message);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Aksi gagal.");
      }
    });
  }

  return (
    <div className="flex gap-2">
      {status !== "ACTIVE" ? (
        <Button size="sm" disabled={isPending} onClick={() => update("ACTIVE", "Toko disetujui.")}>
          Setujui
        </Button>
      ) : null}
      {status !== "SUSPENDED" ? (
        <Button
          size="sm"
          variant="destructive"
          disabled={isPending}
          onClick={() => update("SUSPENDED", "Toko ditangguhkan.")}
        >
          Tangguhkan
        </Button>
      ) : null}
      {status === "SUSPENDED" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => update("PENDING", "Toko dikembalikan ke review.")}
        >
          Kembalikan ke review
        </Button>
      ) : null}
    </div>
  );
}