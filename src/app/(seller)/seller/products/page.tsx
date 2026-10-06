import Link from "next/link";
import { Plus } from "lucide-react";

import { requireSellerPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formatIDR, formatNumber } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductStatusBadge } from "@/components/seller/product-status-badge";
import { ProductRowActions } from "@/components/seller/product-row-actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Kelola Produk" };

export default async function SellerProductsPage() {
  const { store } = await requireSellerPage();

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      basePrice: true,
      soldCount: true,
      updatedAt: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { id: true, stock: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Kelola Produk</h1>
          <p className="text-sm text-muted-foreground">
            {formatNumber(products.length)} produk · perubahan perlu moderasi admin.
          </p>
        </div>
        <Link href="/seller/products/new" className={`${buttonVariants({ size: "sm" })} gap-1`}>
          <Plus className="size-4" /> Tambah produk
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
          <p className="font-medium">Belum ada produk</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambahkan produk pertama, lengkap dengan gambar, variasi, dan stok.
          </p>
          <Link href="/seller/products/new" className={`${buttonVariants()} mt-4`}>
            Tambah produk
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Harga dasar</th>
                <th className="px-4 py-3">Varian</th>
                <th className="px-4 py-3">Terjual</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                return (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">/products/{product.slug}</p>
                    </td>
                    <td className="px-4 py-3">{formatIDR(product.basePrice)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        {product.variants.length}
                        <Badge variant="secondary" className="ml-1">
                          {formatNumber(totalStock)} stok
                        </Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatNumber(product.soldCount)}</td>
                    <td className="px-4 py-3">
                      <ProductStatusBadge status={product.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductRowActions productId={product.id} status={product.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
