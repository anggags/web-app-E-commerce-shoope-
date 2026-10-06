import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PackageOpen } from "lucide-react";

import { requireUserPage } from "@/lib/auth-helpers";
import { getBuyerOrders } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/money";
import { EmptyState } from "@/components/ui/empty-state";
import {
  OrderStatusBadge,
  OrderTimeline,
  PAYMENT_STATUS_LABEL,
} from "@/components/order/order-status-badge";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pesanan Saya" };

export default async function OrdersPage() {
  const user = await requireUserPage();
  if (user.role === "SELLER") redirect("/seller/orders");
  const orders = await getBuyerOrders(user.id);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="size-6" />}
        title="Belum ada pesanan"
        description="Pesanan yang kamu buat akan tampil di sini lengkap dengan status pengiriman."
        action={{ href: "/search", label: "Mulai belanja" }}
        className="mt-8"
      />
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Pesanan Saya</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} pesanan · klik nomor pesanan untuk melihat detail
          </p>
        </div>
      </header>

      {orders.map((order) => (
        <article
          key={order.id}
          className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-shadow hover:shadow-card-hover"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-3">
            <div>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="font-semibold hover:text-primary"
              >
                {order.orderNumber}
              </Link>
              <p className="text-xs text-muted-foreground">
                {order.store.name} · <OrderTimeline createdAt={order.createdAt} />
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {PAYMENT_STATUS_LABEL[order.paymentStatus]}
              </span>
              <OrderStatusBadge status={order.status} />
            </div>
          </header>

          <ul className="divide-y">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill sizes="48px" className="object-cover" />
                  ) : null}
                </div>
                <p className="line-clamp-1 flex-1 text-sm">{item.productName}</p>
                <p className="text-sm text-muted-foreground">x{item.quantity}</p>
              </li>
            ))}
          </ul>

          <footer className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="price font-bold">{formatIDR(order.total)}</span>
          </footer>
        </article>
      ))}
    </div>
  );
}
