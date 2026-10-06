import Link from "next/link";
import { Suspense } from "react";
import { Package, ShieldCheck, Tag } from "lucide-react";

import type { SessionUser } from "@/lib/auth-helpers";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { SearchBar } from "@/components/layout/search-bar";
import { CartButton } from "@/components/layout/cart-button";
import { AnonymousMenu, UserMenu } from "@/components/layout/user-menu";

export function Navbar({ user }: { user: SessionUser | null }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/70 shadow-header backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:border-neutral-800/50 dark:bg-black/70 dark:supports-[backdrop-filter]:bg-black/70">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="block transition-transform duration-200 group-hover:scale-105">
              <Logo className="size-8" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[15px] font-extrabold uppercase tracking-wider text-foreground">
                ANGGA&nbsp;PART
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                Official Store
              </span>
            </span>
          </Link>

          <Suspense
            fallback={<div className="h-10 flex-1 rounded-full bg-muted" aria-hidden />}
          >
            <SearchBar className="min-w-0 flex-1" />
          </Suspense>

          <div className="flex shrink-0 items-center gap-1">
            {user?.role === "ADMIN" ? (
              <Button asChild variant="ghost" size="icon" aria-label="Panel admin">
                <Link href="/admin" className="text-primary">
                  <ShieldCheck className="size-5" />
                </Link>
              </Button>
            ) : null}
            {user ? (
              <>
                <Button asChild variant="ghost" size="icon" aria-label="Pesanan saya">
                  <Link href="/orders">
                    <Package className="size-5" />
                  </Link>
                </Button>
                <CartButton />
                <UserMenu user={user} />
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="icon" aria-label="Jual di sini">
                  <Link href="/seller/register-store">
                    <Tag className="size-5" />
                  </Link>
                </Button>
                <CartButton />
                <AnonymousMenu />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}