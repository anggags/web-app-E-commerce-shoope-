import Link from "next/link";
import {
  Boxes,
  ClipboardCheck,
  DollarSign,
  Store,
  TriangleAlert,
  Users,
} from "lucide-react";

import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatIDR, formatNumber } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { StatCard } from "@/components/seller/stat-card";
import { ProductStatusBadge } from "@/components/seller/product-status-badge";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminPage();

  const [userCount, storeCount, pendingProducts, pendingStores, orderAgg, reviewPending, recentProducts] =
    await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.product.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.store.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        where: { status: { notIn: ["CANCELED", "REFUNDED"] } },
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.review.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({
        where: { status: "PENDING_REVIEW" },
        orderBy: { updatedAt: "asc" },
        take: 8,
        select: {
          id: true,
          name: true,
          basePrice: true,
          status: true,
          store: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Ringkasan Platform</h1>
        <p className="text-sm text-muted-foreground">
          Pantau moderasi produk, persetujuan toko, dan aktivitas transaksi.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          price
          title="Nilai transaksi"
          value={formatIDR(orderAgg._sum.total ?? 0)}
          hint={`${formatNumber(orderAgg._count.id)} order aktif`}
          icon={DollarSign}
          tone="success"
        />
        <StatCard title="Pengguna" value={formatNumber(userCount)} icon={Users} />
        <StatCard title="Toko terdaftar" value={formatNumber(storeCount)} icon={Store} />
        <StatCard
          title="Moderasi produk"
          value={formatNumber(pendingProducts)}
          hint={`${formatNumber(reviewPending)} ulasan menunggu`}
          icon={ClipboardCheck}
          tone={pendingProducts > 0 ? "warning" : "default"}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <header className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
          <h2 className="font-semibold">Produk menunggu moderasi</h2>
          <Link href="/admin/products" className="text-sm font-medium text-primary hover:underline">
            Kelola semua
          </Link>
        </header>

        {pendingStores > 0 ? (
          <p className="flex flex-wrap items-center gap-2 border-b border-warning/30 bg-warning/10 px-5 py-2.5 text-sm">
            <TriangleAlert className="size-4 text-warning" />
            <span className="text-muted-foreground">{pendingStores} toko menunggu persetujuan.</span>
            <Link href="/admin/stores" className="font-medium underline">
              Tinjau sekarang
            </Link>
          </p>
        ) : null}

        {recentProducts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <ClipboardCheck className="mx-auto size-6 text-success" />
            <p className="mt-3 font-medium">Tidak ada produk yang menunggu moderasi</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Semua produk sudah ditinjau. Cek lagi nanti setelah seller mengirim produk baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Produk</th>
                  <th className="px-5 py-2.5 font-medium">Toko</th>
                  <th className="px-5 py-2.5 font-medium">Harga dasar</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-muted/25">
                    <td className="px-5 py-3 font-medium">{product.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{product.store.name}</td>
                    <td className="price px-5 py-3 font-semibold">
                      {formatIDR(product.basePrice)}
                    </td>
                    <td className="px-5 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/products?status=PENDING_REVIEW`}
                        className={buttonVariants({ size: "sm", variant: "outline" })}
                      >
                        <Boxes className="size-3.5" /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}