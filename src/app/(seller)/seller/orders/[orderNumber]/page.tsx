import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { requireSellerPage } from "@/lib/auth-helpers";
import { getSellerOrderByNumber } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/money";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge, OrderTimeline, PAYMENT_STATUS_LABEL } from "@/components/order/order-status-badge";
import { TrackingForm } from "@/components/seller/tracking-form";
import { OrderStatusActions } from "@/components/seller/order-status-actions";

export const dynamic = "force-dynamic";

export default async function SellerOrderDetailPage({
  params,
}: PageProps<"/seller/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const { store } = await requireSellerPage();
  const order = await getSellerOrderByNumber(store.id, orderNumber);

  if (!order) notFound();

  let address: Record<string, string> = {};
  try {
    address = JSON.parse(order.shippingAddress) as Record<string, string>;
  } catch {
    address = { street: order.shippingAddress };
  }

  return (
    <div className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/seller/orders" className="inline-flex items-center gap-1 hover:text-foreground">
          <ChevronLeft className="size-4" /> Pesanan toko
        </Link>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
          <OrderTimeline createdAt={order.createdAt} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {PAYMENT_STATUS_LABEL[order.paymentStatus]}
          </span>
          <OrderStatusBadge status={order.status} />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
            <h2 className="border-b border-border/70 bg-muted/30 px-5 py-3.5 font-semibold">Item pesanan</h2>
            <ul className="divide-y text-sm">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                  </div>
                  <p className="shrink-0">
                    {item.quantity} x {formatIDR(item.subtotal / item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            <footer className="space-y-1.5 border-t border-border/70 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatIDR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkir</span>
                <span className="tabular-nums">{formatIDR(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="font-bold">Total</span>
                <span className="price font-bold">{formatIDR(order.total)}</span>
              </div>
            </footer>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-semibold">Pengiriman</h2>
            <address className="mt-2 space-y-1 text-sm not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{order.recipientName}</p>
              <p>{order.shippingPhone}</p>
              <p>{address.street}</p>
              <p>
                {address.district ? `${address.district}, ` : ""}
                {address.city}, {address.province} {address.postalCode}
              </p>
            </address>

            {order.buyerNote ? (
              <p className="mt-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm">
                Catatan pembeli: {order.buyerNote}
              </p>
            ) : null}

            {order.trackingNumber ? (
              <p className="mt-3 text-sm">
                Resi: <span className="font-medium">{order.courier}</span> ·{" "}
                {order.trackingNumber}
              </p>
            ) : (
              <div className="mt-4">
                <TrackingForm orderNumber={order.orderNumber} />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-semibold">Pembeli</h2>
            <p className="mt-2 text-sm">{order.user.name ?? "-"}</p>
            <p className="text-xs text-muted-foreground">{order.user.email}</p>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-semibold">Ubah status</h2>
            <Separator className="my-3" />
            <OrderStatusActions
              orderId={order.id}
              currentStatus={order.status}
              canCancel={order.status === "PAID" || order.status === "PROCESSING"}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
