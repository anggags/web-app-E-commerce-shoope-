import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingCart, Truck } from "lucide-react";

import { getSessionUser } from "@/lib/auth-helpers";
import { getCartSummary } from "@/lib/queries/cart";
import { formatIDR } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { CartLineControls } from "@/components/cart/cart-line-controls";

export const dynamic = "force-dynamic";

export const metadata = { title: "Keranjang Belanja" };

export default async function CartPage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?callbackUrl=/cart");

  const summary = await getCartSummary(user.id);

  if (summary.lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="size-6" />}
        title="Keranjang masih kosong"
        description="Yuk temukan produk favoritmu di katalog, lalu pilih toko yang kamu suka."
        action={{ href: "/search", label: "Mulai belanja" }}
        className="mt-8"
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Keranjang Belanja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.groups.length} toko · {summary.totalItems} item
          </p>
        </div>
        <Link href="/search" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Lanjut belanja
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {summary.groups.map((group) => (
            <section
              key={group.store.id}
              className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card"
            >
              <header className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-4 py-3">
                <Link
                  href={`/stores/${group.store.slug}`}
                  className="font-semibold hover:text-primary"
                >
                  {group.store.name}
                </Link>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {group.lines.length} item
                </span>
              </header>

              <ul className="divide-y">
                {group.lines.map((line) => (
                  <li key={line.cartItemId} className="flex gap-4 p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {line.imageUrl ? (
                        <Image
                          src={line.imageUrl}
                          alt={line.productName}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${line.productSlug}`}
                        className="line-clamp-2 text-sm font-medium hover:text-primary"
                      >
                        {line.productName}
                      </Link>
                      <p className="text-xs text-muted-foreground">{line.variantName}</p>
                      <p className="price mt-1 text-sm font-bold">{formatIDR(line.price)}</p>

                      {!line.isAvailable ? (
                        <p className="mt-1 text-xs font-medium text-destructive">
                          Stok tersisa {line.stock}. Hapus atau kurangi jumlah.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end justify-between gap-2">
                      <CartLineControls
                        cartItemId={line.cartItemId}
                        quantity={line.quantity}
                        stock={line.stock}
                        isAuthenticated
                      />
                      <p className="price text-sm font-bold">{formatIDR(line.subtotal)}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-3 text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="size-4" /> Ongkir {group.store.name}
                </span>
                <span className="font-medium tabular-nums">
                  {group.shippingFee === 0 ? "Gratis" : formatIDR(group.shippingFee)}
                </span>
              </footer>
            </section>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-5 shadow-card lg:sticky lg:top-28">
          <h2 className="font-semibold">Ringkasan Belanja</h2>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal ({summary.totalItems} item)</dt>
              <dd className="tabular-nums">{formatIDR(summary.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total ongkir</dt>
              <dd className="tabular-nums">{formatIDR(summary.shippingFee)}</dd>
            </div>
          </dl>

          <Separator className="my-4" />

          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Total bayar</span>
            <span className="price text-xl font-bold">{formatIDR(summary.grandTotal)}</span>
          </div>

          <div className="mt-5 space-y-2">
            {summary.hasUnavailable ? (
              <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                Ada item bermasalah. Perbaiki keranjang sebelum checkout.
              </p>
            ) : null}
            <Link
              href="/checkout"
              aria-disabled={summary.hasUnavailable}
              className={`${buttonVariants({ size: "lg", className: "w-full" })} ${
                summary.hasUnavailable ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Lanjut ke checkout
            </Link>
            <Link
              href="/search"
              className={`${buttonVariants({ variant: "outline", className: "w-full" })}`}
            >
              Lanjut belanja
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
