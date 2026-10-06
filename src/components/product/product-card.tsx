import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { calculateDiscountPercent, formatIDR, formatNumber } from "@/lib/money";

export type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    basePrice: number;
    soldCount: number;
    rating: number;
    ratingCount: number;
    images: { url: string; alt: string | null }[];
    store: { name: string; slug: string };
    variants: { price: number; compareAtPrice: number | null }[];
  };
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const image = product.images[0]?.url;
  const compareAtPrice = product.variants.find((v) => v.compareAtPrice)?.compareAtPrice ?? null;
  const discount = calculateDiscountPercent(product.basePrice, compareAtPrice);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover">
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={product.name}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.images[0]?.alt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              Tanpa gambar
            </div>
          )}

          {discount ? (
            <Badge className="absolute left-2.5 top-2.5 bg-destructive text-destructive-foreground shadow-sm">
              -{discount}%
            </Badge>
          ) : null}

          {product.soldCount >= 50 ? (
            <Badge className="absolute right-2.5 top-2.5 border-transparent bg-foreground/85 text-background backdrop-blur">
              Terlaris
            </Badge>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <Link
          href={`/stores/${product.store.slug}`}
          className="w-fit truncate rounded text-xs text-muted-foreground hover:text-primary"
        >
          {product.store.name}
        </Link>

        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-medium leading-snug"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-2.5">
          <p className="price text-base font-bold">{formatIDR(product.basePrice)}</p>
          {compareAtPrice && compareAtPrice > product.basePrice ? (
            <p className="text-xs text-muted-foreground line-through">
              {formatIDR(compareAtPrice)}
            </p>
          ) : null}
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 font-medium text-amber-600 tabular-nums">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.ratingCount > 0 ? product.rating.toFixed(1) : "-"}
            </span>
            <span aria-hidden className="h-3 w-px bg-border" />
            <span className="tabular-nums">{formatNumber(product.soldCount)} terjual</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-2 p-3.5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
