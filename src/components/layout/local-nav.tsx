import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const ANGGA_NEW_IN = [
  { href: "/search?sort=terbaru", label: "Produk Terbaru" },
  { href: "/search?sort=terlaris", label: "Terlaris" },
  { href: "/search?sort=rating", label: "Rating Tertinggi" },
];

const FEATURED_CATEGORIES = ["Elektronik", "Kecantikan", "Makanan"];

export function LocalNav() {
  return (
    <div className="sticky top-16 z-40 w-full border-b border-neutral-200/50 bg-white/70 shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-neutral-800/50 dark:bg-black/70 dark:supports-[backdrop-filter]:bg-black/70">
      <div className="container-page">
        <div className="flex h-11 items-center justify-between gap-3">
          <nav
            aria-label="Kategori ANGGA PART"
            className="flex min-w-0 items-center gap-0.5 overflow-x-auto"
          >
            <Button
              asChild
              variant="ghost"
              size="xs"
              className="shrink-0 rounded-full px-3 text-[13px] text-foreground"
            >
              <Link href="/search">Semua</Link>
            </Button>

            {FEATURED_CATEGORIES.map((category, index) => (
              <span key={category} className="inline-flex items-center gap-0.5">
                <span className="mx-0.5 h-3.5 w-px shrink-0 bg-border" aria-hidden />
                <Button
                  asChild
                  variant="ghost"
                  size="xs"
                  className="shrink-0 rounded-full px-3 text-[13px] text-muted-foreground hover:text-foreground"
                >
                  <Link
                    href={`/search?category=${encodeURIComponent(category)}`}
                    aria-label={`Kategori ${category}`}
                  >
                    {index === 0 ? (
                      <>
                        <Sparkles className="size-3 text-primary" />
                        {category}
                      </>
                    ) : (
                      category
                    )}
                  </Link>
                </Button>
              </span>
            ))}

            {ANGGA_NEW_IN.map((link) => (
              <span key={link.href} className="inline-flex items-center gap-0.5">
                <span className="mx-0.5 h-3.5 w-px shrink-0 bg-border" aria-hidden />
                <Button
                  asChild
                  variant="ghost"
                  size="xs"
                  className="shrink-0 rounded-full px-3 text-[13px] text-muted-foreground hover:text-foreground"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </span>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/search">
                Jelajahi Katalog
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-full px-4 font-semibold">
              <Link href="/search">Beli Sekarang</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}