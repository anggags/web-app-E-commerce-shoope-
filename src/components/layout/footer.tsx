import Link from "next/link";
import { Mail, MapPin, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";

import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Belanja",
    links: [
      { href: "/search", label: "Semua produk" },
      { href: "/search?sort=terlaris", label: "Produk terlaris" },
      { href: "/search?sort=rating", label: "Rating tertinggi" },
      { href: "/cart", label: "Keranjang" },
      { href: "/orders", label: "Lacak pesanan" },
    ],
  },
  {
    title: "Seller",
    links: [
      { href: "/seller/register-store", label: "Buka toko" },
      { href: "/seller", label: "Dashboard toko" },
      { href: "/seller/products", label: "Kelola produk" },
      { href: "/seller/orders", label: "Pesanan masuk" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { href: "/sign-in", label: "Masuk" },
      { href: "/register", label: "Daftar akun" },
      { href: "/account/addresses", label: "Alamat pengiriman" },
    ],
  },
];

const PROMISES = [
  { icon: Store, label: "Ribuan toko independen" },
  { icon: Truck, label: "Ongkir dihitung per toko" },
  { icon: ShieldCheck, label: "Produk dimoderasi admin" },
  { icon: ShoppingBag, label: "Checkout sekali bayar" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/30">
      <div className="container-page">
        <div className="grid gap-8 py-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo className="size-8" />
              <span className="text-base font-extrabold uppercase tracking-wider">ANGGA PART</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Official store multi-vendor: komponen, aksesori, dan perlengkapan pilihan.
              Presisi. Performa. Kesempurnaan.
            </p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {PROMISES.map((promise) => (
                <li key={promise.label} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <promise.icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  {promise.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/70 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ANGGA PART · Website demo, bukan toko sungguhan.</p>
          <p className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> Indonesia
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" /> hello@anggapart.store
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}