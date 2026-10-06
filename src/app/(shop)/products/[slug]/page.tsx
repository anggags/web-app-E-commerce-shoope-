import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, Package, Store as StoreIcon } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { getProductBySlug } from "@/lib/queries/products";
import { getSessionUser } from "@/lib/auth-helpers";
import { formatIDR, formatNumber } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RatingStars } from "@/components/product/rating-stars";
import { ProductGallery } from "@/components/product/product-gallery";
import {
  VariantSelector,
  type SelectorVariant,
} from "@/components/product/variant-selector";
import { ReviewList } from "@/components/product/review-list";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return { title: product.name, description: product.description.slice(0, 150) };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const user = await getSessionUser();
  const primaryImage = product.images[0]?.url ?? null;

  void prisma.product
    .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => undefined);

  const variants: SelectorVariant[] = product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    options: (variant.options ?? {}) as Record<string, string>,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    stock: variant.stock,
  }));

  return (
    <div className="space-y-8 pb-8">
      <nav aria-label="Remah roti" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Beranda
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/search" className="hover:text-foreground">
          Produk
        </Link>
        {product.category ? (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link
              href={`/search?category=${encodeURIComponent(product.category)}`}
              className="hover:text-foreground"
            >
              {product.category}
            </Link>
          </>
        ) : null}
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="truncate font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery
          images={product.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: image.alt,
          }))}
          alt={product.name}
        />

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Package className="size-4" /> {formatNumber(product.soldCount)} terjual
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {product.store.city ?? "-"}
              </span>
              {product.viewCount > 0 ? (
                <span className="tabular-nums">{formatNumber(product.viewCount)} dilihat</span>
              ) : null}
            </div>
          </div>

          <Link
            href={`/stores/${product.store.slug}`}
            className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <StoreIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Dijual oleh
              </p>
              <p className="truncate font-semibold group-hover:text-primary">
                {product.store.name}
              </p>
            </div>
            <RatingStars
              rating={product.rating}
              ratingCount={product.ratingCount}
              className="ml-auto"
            />
          </Link>

          <VariantSelector
            productSlug={product.slug}
            productName={product.name}
            productId={product.id}
            imageUrl={primaryImage}
            optionNames={product.options}
            variants={variants}
            isAuthenticated={Boolean(user)}
            store={{ id: product.store.id, name: product.store.name, slug: product.store.slug }}
          />

          <Separator />

          <div>
            <h2 className="font-semibold">Deskripsi produk</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <dl className="grid gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted-foreground">Kategori</dt>
              <dd className="font-medium">{product.category ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Kota pengiriman</dt>
              <dd className="font-medium">{product.store.city ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Ulasan</dt>
              <dd className="font-medium tabular-nums">{formatNumber(product.ratingCount)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <Separator />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Ulasan pembeli</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.ratingCount > 0
                ? `${formatNumber(product.ratingCount)} ulasan untuk produk ini`
                : "Belum ada ulasan untuk produk ini"}
            </p>
          </div>
          {product.ratingCount > 0 ? (
            <Badge variant="secondary" className="tabular-nums">
              {formatIDR(product.basePrice)}
            </Badge>
          ) : null}
        </div>
        <ReviewList reviews={product.reviews} />
      </section>
    </div>
  );
}
