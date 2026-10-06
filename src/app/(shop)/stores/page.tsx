import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Star } from "lucide-react";

import { getActiveStores } from "@/lib/queries/products";
import { formatNumber } from "@/lib/money";
import { StoreAvatar } from "@/components/store/store-card";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daftar Toko",
  description:
    "Jelajahi semua toko terverifikasi di ANGGA PART: electronics, makanan sehat, dan lainnya.",
};

export default async function StoresPage() {
  const stores = await getActiveStores();

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Jelajahi Toko</h1>
        <p className="text-sm text-muted-foreground">
          {stores.length} toko terverifikasi yang siap melayani pesananmu.
        </p>
      </header>

      {stores.length === 0 ? (
        <EmptyState
          title="Belum ada toko terdaftar"
          description="Seller belum membuka toko. Coba lagi nanti."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="group rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="flex items-center gap-4">
                <StoreAvatar name={store.name} className="size-14 text-base" />
                <div className="min-w-0">
                  <h2 className="truncate font-bold group-hover:text-primary">
                    {store.name}
                  </h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {store.city ?? "Indonesia"}
                  </p>
                </div>
              </div>

              {store.description ? (
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                  {store.description}
                </p>
              ) : null}

              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4 text-sm">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  {store.rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({formatNumber(store.ratingCount)})
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {formatNumber(store._count.products)} produk
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}