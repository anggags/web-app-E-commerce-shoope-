import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminNavLink } from "@/components/admin/admin-nav-link";
import { requireAdminPage } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export const metadata = { title: { default: "Admin", template: "%s · Admin" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdminPage();

  return (
    <div className="flex min-h-screen flex-col bg-muted/25">
      <header className="border-b border-border/70 bg-background shadow-header">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-[18px]" />
            </span>
            <span className="flex flex-col leading-none">
              <span>Admin Dashboard</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Moderasi & kendali
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <AdminNavLink href="/admin">Ringkasan</AdminNavLink>
            <AdminNavLink href="/admin/products">Moderasi produk</AdminNavLink>
            <AdminNavLink href="/admin/users">Pengguna</AdminNavLink>
            <AdminNavLink href="/admin/stores">Toko</AdminNavLink>
          </nav>

          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ExternalLink className="size-3.5" />
              Katalog
            </Link>
          </Button>
        </div>

        <nav className="container-page flex items-center gap-1 overflow-x-auto border-t border-border/60 py-1.5 md:hidden">
          <AdminNavLink href="/admin">Ringkasan</AdminNavLink>
          <AdminNavLink href="/admin/products">Moderasi produk</AdminNavLink>
          <AdminNavLink href="/admin/users">Pengguna</AdminNavLink>
          <AdminNavLink href="/admin/stores">Toko</AdminNavLink>
        </nav>
      </header>

      <main className="container-page flex-1 py-6 lg:py-8">{children}</main>
    </div>
  );
}