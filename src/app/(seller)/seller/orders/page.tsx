import Link from "next/link";

import { requireSellerPage } from "@/lib/auth-helpers";
import { getSellerOrders } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge, OrderTimeline } from "@/components/order/order-status-badge";
import { SellerOrderFilters } from "@/components/seller/seller-order-filters";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pesanan Masuk" };

const FILTERS = [
  { value: "all", label: "Semua" },
  { value: "AWAITING_PAYMENT", label: "Menunggu bayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELED", label: "Dibatalkan" },
];

export default async function SellerOrdersPage({ searchParams }: PageProps<"/seller/orders">) {
  const { store } = await requireSellerPage();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "all";
  const orders = await getSellerOrders(store.id, status);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Pesanan Masuk</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan resi setelah paket diserahkan ke kurir.
        </p>
      </div>

      <SellerOrderFilters filters={FILTERS} active={status} />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-sm text-muted-foreground">
          Belum ada pesanan pada filter ini.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                <div>
                  <Link
                    href={`/seller/orders/${order.orderNumber}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {order.recipientName} · <OrderTimeline createdAt={order.createdAt} />
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="price text-sm font-bold">{formatIDR(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </header>

              <ul className="divide-y">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-4 py-2 text-sm">
                    <span className="line-clamp-1">{item.productName}</span>
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </li>
                ))}
              </ul>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {order.trackingNumber
                    ? `Resi: ${order.courier} ${order.trackingNumber}`
                    : "Belum ada resi"}
                </span>
                <Link
                  href={`/seller/orders/${order.orderNumber}`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  Kelola pesanan
                </Link>
              </footer>
            </article>
          ))}
        </div>
      )}

      <Link href="/seller" className={buttonVariants({ variant: "ghost" })}>
        Kembali ke dashboard
      </Link>
    </div>
  );
}
