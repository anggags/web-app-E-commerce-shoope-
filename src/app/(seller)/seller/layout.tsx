import Link from "next/link";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";

import { requireUserPage } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { SellerHeader, SellerNav } from "@/components/seller/seller-nav";

export const dynamic = "force-dynamic";

export const metadata = { title: { default: "Seller Centre", template: "%s · Seller" } };

export default async function SellerLayout({ children }: LayoutProps<"/seller">) {
  const user = await requireUserPage();
  const store = await prisma.store.findUnique({
    where: { ownerId: user.id },
    select: { name: true, slug: true, status: true },
  });

  if (!store) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-muted/25">
      <header className="border-b border-border/70 bg-background shadow-header">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/seller" className="flex items-center gap-2.5 font-bold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Store className="size-[18px]" />
            </span>
            <span className="flex flex-col leading-none">
              <span>Seller Centre</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {store.name}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Lihat katalog</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/orders">Pesanan saya</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container-page grid flex-1 gap-6 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-8">
        <aside className="h-fit space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-card lg:sticky lg:top-24">
          <SellerHeader storeName={store.name} storeStatus={store.status} />
          <SellerNav />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
