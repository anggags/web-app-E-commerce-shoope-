import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getHomeData } from "@/lib/queries/products";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { StoreCard } from "@/components/store/store-card";
import { HeroBanner } from "@/components/home/hero-banner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { newest, bestSeller, categories, stores } = await getHomeData();

  return (
    <div className="space-y-14 pb-8">
      <HeroBanner />

      {categories.length > 0 ? (
        <section>
          <SectionHeader title="Kategori" href="/search" linkLabel="Semua kategori" />
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
                <span className="inline-flex items-center rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-sm font-medium shadow-card transition-colors hover:border-primary/40 hover:text-primary">
                  {category}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {bestSeller.length > 0 ? (
        <section>
          <SectionHeader
            title="Produk Terlaris"
            href="/search?sort=terlaris"
            linkLabel="Lihat semua"
            subtitle="Paling banyak dibeli pembeli lain"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bestSeller.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        </section>
      ) : null}

      {stores.length > 0 ? (
        <section>
          <SectionHeader
            title="Toko Pilihan"
            href="/search"
            linkLabel="Jelajahi toko"
            subtitle="Seller dengan rating tertinggi"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title="Produk Terbaru"
          href="/search?sort=terbaru"
          linkLabel="Lihat semua"
          subtitle="Baru saja masuk katalog"
        />
        {newest.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {newest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyCatalog />
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  href,
  linkLabel,
  subtitle,
}: {
  title: string;
  href: string;
  linkLabel: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        {linkLabel}
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <p className="text-base font-semibold">Katalog masih kosong</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Jalankan{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">npm run db:seed</code>{" "}
        untuk mengisi data contoh, atau jadi seller pertama.
      </p>
      <Link href="/seller/register-store" className={`${buttonVariants()} mt-5`}>
        Jadi seller pertama
      </Link>
    </div>
  );
}