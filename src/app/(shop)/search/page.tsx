import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal } from "lucide-react";

import { listProducts } from "@/lib/queries/products";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "termurah", label: "Harga terendah" },
  { value: "termahal", label: "Harga tertinggi" },
  { value: "rating", label: "Rating tertinggi" },
] as const;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const storeId = typeof params.storeId === "string" ? params.storeId : undefined;
  const sortRaw = typeof params.sort === "string" ? params.sort : "terbaru";
  const sort = (SORT_OPTIONS.find((option) => option.value === sortRaw)?.value ??
    "terbaru") as (typeof SORT_OPTIONS)[number]["value"];

  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const { items, total, totalPages } = await listProducts({ query, category, storeId, sort, page });

  function buildUrl(next: { page?: number; sort?: string }) {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (category) searchParams.set("category", category);
    if (storeId) searchParams.set("storeId", storeId);
    searchParams.set("sort", next.sort ?? sort);
    if (next.page && next.page > 1) searchParams.set("page", String(next.page));
    return `/search?${searchParams.toString()}`;
  }

  const hasFilter = Boolean(query || category || storeId);

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            {query ? `Hasil pencarian "${query}"` : "Semua produk"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} produk ditemukan
            {category ? " · kategori " : ""}
            {category ? <span className="font-medium text-foreground">{category}</span> : null}
          </p>
        </div>

        {hasFilter ? (
          <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Reset filter
          </Link>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card p-3 shadow-card">
        <span className="ml-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          Urutkan
        </span>
        {SORT_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={buildUrl({ sort: option.value })}
            aria-current={option.value === sort ? "true" : undefined}
            className={
              option.value === sort
                ? buttonVariants({ size: "sm" })
                : buttonVariants({ size: "sm", variant: "ghost" })
            }
          >
            {option.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="size-6" />}
          title="Produk tidak ditemukan"
          description="Coba kata kunci lain, hapus filter kategori, atau jelajahi seluruh katalog."
          action={{ href: "/search", label: "Lihat semua produk" }}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              className="flex items-center justify-center gap-3 pt-2"
              aria-label="Navigasi halaman"
            >
              <Link
                href={buildUrl({ page: page - 1 })}
                aria-disabled={page <= 1}
                className={`${buttonVariants({ variant: "outline" })} ${
                  page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Link>
              <span className="text-sm text-muted-foreground tabular-nums">
                Halaman {page} dari {totalPages}
              </span>
              <Link
                href={buildUrl({ page: page + 1 })}
                aria-disabled={page >= totalPages}
                className={`${buttonVariants({ variant: "outline" })} ${
                  page >= totalPages ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Link>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}