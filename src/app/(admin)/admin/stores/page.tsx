import Link from "next/link";

import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/money";
import { AdminStatusFilter } from "@/components/admin/admin-status-filter";
import { AdminStoreActions } from "@/components/admin/admin-store-actions";
import type { StoreStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata = { title: "Toko" };

const FILTERS: { value: string; label: string }[] = [
  { value: "PENDING", label: "Menunggu persetujuan" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "SUSPENDED", label: "Ditangguhkan" },
  { value: "all", label: "Semua" },
];

export default async function AdminStoresPage({ searchParams }: PageProps<"/admin/stores">) {
  await requireAdminPage();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "PENDING";

  const stores = await prisma.store.findMany({
    where: status === "all" ? {} : { status: status as StoreStatus },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      city: true,
      createdAt: true,
      owner: { select: { name: true, email: true } },
      _count: { select: { products: true, orders: true } },
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Toko</h1>
        <p className="text-sm text-muted-foreground">
          Setujui toko baru agar seller bisa berjualan.
        </p>
      </div>

      <AdminStatusFilter filters={FILTERS} active={status} basePath="/admin/stores" />

      {stores.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-sm text-muted-foreground">
          Tidak ada toko pada filter ini.
        </p>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <article key={store.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{store.name}</h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{store.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {store.owner.name ?? "-"} · {store.owner.email}
                  {store.city ? ` · ${store.city}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(store._count.products)} produk ·{" "}
                  {formatNumber(store._count.orders)} order ·{" "}
                  <Link href={`/stores/${store.slug}`} className="text-primary hover:underline">
                    Lihat halaman toko
                  </Link>
                </p>
              </div>
              <AdminStoreActions storeId={store.id} status={store.status} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}