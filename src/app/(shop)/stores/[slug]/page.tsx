import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";

import { getStoreBySlug, listProducts } from "@/lib/queries/products";
import { formatNumber } from "@/lib/money";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { StoreAvatar } from "@/components/store/store-card";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  return { title: store ? store.name : "Toko tidak ditemukan" };
}

export default async function StorePage({ params }: PageProps<"/stores/[slug]">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);

  if (!store) notFound();

  const { items } = await listProducts({ storeId: store.id, perPage: 12 });

  return (
    <div className="space-y-6 pb-8">
      <header className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
        <div className="bg-surface-grid px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <StoreAvatar name={store.name} className="size-20 text-2xl" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
                <p className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-4" /> {store.city ?? "Seluruh Indonesia"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm backdrop-blur">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {store.rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">
                  ({formatNumber(store.ratingCount)} ulasan)
                </span>
              </span>
              <span aria-hidden className="h-5 w-px bg-border" />
              <span className="text-muted-foreground">
                {formatNumber(store._count.products)} produk
              </span>
            </div>
          </div>
        </div>

        {store.description ? (
          <p className="mx-auto max-w-5xl px-6 py-4 text-sm text-muted-foreground">
            {store.description}
          </p>
        ) : null}
      </header>

      <div className="mx-auto max-w-5xl">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center text-sm text-muted-foreground">
            Toko ini belum memiliki produk aktif.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/search" className={buttonVariants({ variant: "outline" })}>
            Lihat produk lainnya
          </Link>
        </div>
      </div>
    </div>
  );
}