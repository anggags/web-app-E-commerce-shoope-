import Link from "next/link";

import { requireAdminPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatIDR } from "@/lib/money";
import { ProductStatusBadge } from "@/components/seller/product-status-badge";
import { AdminProductActions } from "@/components/admin/admin-product-actions";
import { AdminStatusFilter } from "@/components/admin/admin-status-filter";
import type { ProductStatus } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export const metadata = { title: "Moderasi Produk" };

const FILTERS: { value: string; label: string }[] = [
  { value: "PENDING_REVIEW", label: "Menunggu moderasi" },
  { value: "ACTIVE", label: "Tayang" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "DRAFT", label: "Draft" },
  { value: "all", label: "Semua" },
];

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdminPage();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "PENDING_REVIEW";

  const products = await prisma.product.findMany({
    where: status === "all" ? {} : { status: status as ProductStatus },
    orderBy: { updatedAt: "asc" },
    take: 100,
    select: {
      id: true,
      name: true,
      description: true,
      basePrice: true,
      status: true,
      updatedAt: true,
      store: { select: { name: true, slug: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { stock: true, price: true } },
    },
  });

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Moderasi Produk</h1>
        <p className="text-sm text-muted-foreground">
          Setujui produk agar tayang, atau tolak dengan alasan ke seller.
        </p>
      </div>

      <AdminStatusFilter filters={FILTERS} active={status} basePath="/admin/products" />

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-sm text-muted-foreground">
          Tidak ada produk pada status ini.
        </p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start gap-4">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="size-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="size-16 rounded-lg bg-muted" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold">{product.name}</h2>
                    <ProductStatusBadge status={product.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <Link href={`/stores/${product.store.slug}`} className="hover:underline">
                      {product.store.name}
                    </Link>{" "}
                    · {product.variants.length} varian · harga dasar {formatIDR(product.basePrice)}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </p>
                </div>

                <AdminProductActions productId={product.id} status={product.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}