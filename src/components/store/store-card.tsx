import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

import { formatNumber } from "@/lib/money";

export function StoreAvatar({
  name,
  logoUrl,
  className = "size-11",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden rounded-xl border bg-muted ${className}`}
      >
        <Image src={logoUrl} alt={name} fill sizes="48px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground ${className}`}
      aria-hidden
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function StoreCard({
  store,
}: {
  store: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    logoUrl?: string | null;
    rating: number;
    _count: { products: number };
  };
}) {
  return (
    <Link
      href={`/stores/${store.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover"
    >
      <StoreAvatar name={store.name} logoUrl={store.logoUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold group-hover:text-primary">{store.name}</p>
        <p className="text-xs text-muted-foreground">{store.city ?? "Seluruh Indonesia"}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          {store.rating.toFixed(1)}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatNumber(store._count.products)} produk
        </p>
      </div>
    </Link>
  );
}