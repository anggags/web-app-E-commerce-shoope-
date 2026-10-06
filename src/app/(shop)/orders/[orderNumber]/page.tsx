import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck } from "lucide-react";

import { requireUserPage } from "@/lib/auth-helpers";
import { getBuyerOrderByNumber } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ORDER_STATUS_LABEL,
  OrderStatusBadge,
  OrderTimeline,
  PAYMENT_STATUS_LABEL,
} from "@/components/order/order-status-badge";
import { ReviewForm } from "@/components/product/review-form";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const user = await requireUserPage();
  const order = await getBuyerOrderByNumber(user.id, orderNumber);

  if (!order) notFound();

  let shippingAddress: Record<string, string> = {};
  try {
    shippingAddress = JSON.parse(order.shippingAddress) as Record<string, string>;
  } catch {
    shippingAddress = { street: order.shippingAddress };
  }

  return (
    <div className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/orders" className="hover:text-foreground">
          Pesanan saya
        </Link>
        <ChevronRight className="size-4" />
        <span className="truncate font-medium text-foreground">{order.orderNumber}</span>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
            <h2 className="border-b border-border/70 bg-muted/30 px-5 py-3.5 font-semibold">
              Produk dari {order.store.name}
            </h2>
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 p-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatIDR(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="price text-sm font-bold">{formatIDR(item.subtotal)}</p>
                </li>
              ))}
            </ul>
          </section>

          {order.status === "COMPLETED" || order.status === "SHIPPED" ? (
            <section className="space-y-3">
              <h2 className="font-semibold">Beri ulasan</h2>
              {order.items.map((item) => (
                <ReviewForm
                  key={item.id}
                  orderItemId={item.id}
                  productName={item.productName}
                />
              ))}
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-semibold">Alamat pengiriman</h2>
            <address className="mt-2 space-y-1 text-sm not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{shippingAddress.recipientName}</p>
              <p>{shippingAddress.phone}</p>
              <p>{shippingAddress.street}</p>
              <p>
                {shippingAddress.district ? `${shippingAddress.district}, ` : ""}
                {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}
              </p>
            </address>
          </section>

          {order.trackingNumber ? (
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <h2 className="flex items-center gap-2 font-semibold">
                <Truck className="size-4 text-primary" /> Pengiriman
              </h2>
              <p className="mt-2 text-sm">
                {order.courier} · {order.trackingNumber}
              </p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
            <h2 className="font-semibold">Ringkasan</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ongkir</dt>
                <dd className={order.shippingFee === 0 ? "text-success" : "tabular-nums"}>
                  {order.shippingFee === 0 ? "Gratis" : formatIDR(order.shippingFee)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Metode</dt>
                <dd>{order.paymentMethod}</dd>
              </div>
            </dl>
            <Separator className="my-3" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="price font-bold">{formatIDR(order.total)}</span>
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Status: {ORDER_STATUS_LABEL[order.status]}
          </p>

          <Link
            href="/orders"
            className={`${buttonVariants({ variant: "outline", className: "w-full" })}`}
          >
            Kembali ke daftar pesanan
          </Link>
        </aside>
      </div>
    </div>
  );
}
