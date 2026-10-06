"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/lib/actions/order";
import { Button } from "@/components/ui/button";
import type { OrderStatus } from "@/generated/prisma/enums";

const NEXT_STEPS: Record<OrderStatus, { status: OrderStatus; label: string; variant?: "destructive" }[]> = {
  AWAITING_PAYMENT: [],
  PAID: [
    { status: "PROCESSING", label: "Konfirmasi & proses" },
    { status: "SHIPPED", label: "Tandai dikirim" },
    { status: "CANCELED", label: "Batalkan", variant: "destructive" },
  ],
  PROCESSING: [
    { status: "SHIPPED", label: "Tandai dikirim" },
    { status: "CANCELED", label: "Batalkan", variant: "destructive" },
  ],
  SHIPPED: [{ status: "COMPLETED", label: "Tandai selesai" }],
  COMPLETED: [],
  CANCELED: [],
  REFUNDED: [],
};

export function OrderStatusActions({
  orderId,
  currentStatus,
  canCancel,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const steps = NEXT_STEPS[currentStatus].filter(
    (step) => canCancel || step.status !== "CANCELED",
  );

  if (steps.length === 0) {
    return <p className="text-sm text-muted-foreground">Tidak ada perubahan status tersedia.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => (
        <Button
          key={step.status}
          type="button"
          size="sm"
          variant={step.variant ?? "default"}
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              try {
                await updateOrderStatusAction(orderId, step.status);
                toast.success(`Status order diubah ke ${step.label.toLowerCase()}.`);
                router.refresh();
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Gagal mengubah status.");
              }
            })
          }
        >
          {step.label}
        </Button>
      ))}
    </div>
  );
}