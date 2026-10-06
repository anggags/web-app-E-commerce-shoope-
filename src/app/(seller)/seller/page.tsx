import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Boxes,
  PackageCheck,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { requireSellerPage } from "@/lib/auth-helpers";
import { getSellerStats } from "@/lib/queries/orders";
import { formatIDR, formatNumber } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/seller/stat-card";
import { OrderTimeline } from "@/components/order/order-status-badge";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const { store } = await requireSellerPage();
  const stats = await getSellerStats(store.id);

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Toko</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan performa {store.name} 30 hari terakhir.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/seller/products/new"
            className={`${buttonVariants({ size: "sm" })} gap-1`}
          >
            <Plus className="size-4" /> Tambah produk
          </Link>
        </div>
      </div>

      {store.status === "PENDING" ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-muted-foreground">
            Toko kamu belum disetujui admin. Produk yang dikirim tidak akan tayang sampai toko
            berstatus ACTIVE.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          price
          title="Pendapatan 30 hari"
          value={formatIDR(stats.revenue30d)}
          hint={`Total sepanjang waktu ${formatIDR(stats.revenue)}`}
          icon={Banknote}
          tone="success"
        />
        <StatCard
          title="Pesanan 30 hari"
          value={formatNumber(stats.orderCount30d)}
          hint={`${stats.awaitingShipment} menunggu dikirim`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Produk aktif"
          value={formatNumber(stats.activeProducts)}
          hint={`${stats.pendingProducts} menunggu moderasi`}
          icon={Boxes}
        />
        <StatCard
          title="Dalam pengiriman"
          value={formatNumber(stats.shippedOrders)}
          hint={`${stats.totalProducts} produk total`}
          icon={PackageCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Stok menipis</h2>
            <Link href="/seller/products" className="text-sm font-medium text-primary hover:underline">
              Kelola produk
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <div className="mt-4 rounded-xl bg-success/10 p-4 text-sm text-success">
              Semua varian memiliki stok aman.
            </div>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {stats.lowStock.map((variant) => (
                <li
                  key={variant.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{variant.product.name}</p>
                    <p className="text-xs text-muted-foreground">{variant.name}</p>
                  </div>
                  <span className="price shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold">
                    {variant.stock} tersisa
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Aksi cepat</h2>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li className="rounded-xl border border-border/60 px-3 py-2.5">
              <Link href="/seller/orders" className="font-medium text-primary hover:underline">
                Proses {stats.awaitingShipment} pesanan yang perlu dikirim
              </Link>
            </li>
            <li className="rounded-xl border border-border/60 px-3 py-2.5">
              <Link href="/seller/products/new" className="font-medium text-primary hover:underline">
                Tambah produk baru
              </Link>
            </li>
            <li className="rounded-xl border border-border/60 px-3 py-2.5">
              <Link href={`/stores/${store.slug}`} className="font-medium text-primary hover:underline">
                Lihat halaman toko publik
              </Link>
            </li>
          </ul>

          {store.status === "PENDING" ? (
            <p className="mt-4 text-xs text-muted-foreground">
              <OrderTimeline createdAt={new Date()} /> Toko menunggu verifikasi admin.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
