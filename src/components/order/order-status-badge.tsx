import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Menunggu pembayaran",
  PAID: "Sudah dibayar",
  PROCESSING: "Sedang diproses",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  PAID: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  PROCESSING: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400",
  SHIPPED: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELED: "bg-destructive/15 text-destructive",
  REFUNDED: "bg-muted text-muted-foreground",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Belum dibayar",
  PAID: "Lunas",
  FAILED: "Gagal",
  REFUNDED: "Dikembalikan",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", ORDER_STATUS_STYLE[status])}>
      {ORDER_STATUS_LABEL[status]}
    </Badge>
  );
}

export function OrderTimeline({ createdAt }: { createdAt: Date }) {
  return (
    <p className="text-xs text-muted-foreground">
      Dibuat {format(createdAt, "d MMM yyyy, HH:mm", { locale: id })}
    </p>
  );
}
