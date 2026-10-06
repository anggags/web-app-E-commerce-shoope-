import Link from "next/link";
import { notFound } from "next/navigation";

import { requireSellerPage } from "@/lib/auth-helpers";
import { getProductByIdForSeller } from "@/lib/queries/products";
import { ProductEditForm } from "@/components/seller/product-edit-form";
import { ProductStatusBadge } from "@/components/seller/product-status-badge";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/seller/products/[id]">) {
  const { id } = await params;
  const { store } = await requireSellerPage();
  const product = await getProductByIdForSeller(id, store.id);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            Ubah Produk <ProductStatusBadge status={product.status} />
          </h1>
          <p className="text-sm text-muted-foreground">
            Perubahan akan mengembalikan produk ke status menunggu moderasi.
          </p>
        </div>
        <Link href={`/products/${product.slug}`} className="text-sm text-primary hover:underline">
          Lihat halaman publik
        </Link>
      </div>

      <ProductEditForm product={product} />
    </div>
  );
}