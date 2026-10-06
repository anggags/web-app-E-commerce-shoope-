import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CreditCard, Store, Truck } from "lucide-react";

import { getSessionUser } from "@/lib/auth-helpers";
import { Logo } from "@/components/brand/logo";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  {
    icon: Store,
    title: "Ribuan toko independen",
    description: "Satu keranjang bisa berisi produk dari banyak seller berbeda.",
  },
  {
    icon: Truck,
    title: "Ongkir & resi per toko",
    description: "Setiap seller menghitung ongkir dan input resi sendiri.",
  },
  {
    icon: CreditCard,
    title: "Checkout sekali bayar",
    description: "Ringkasan pembayaran digabung otomatis untuk semua toko.",
  },
  {
    icon: BadgeCheck,
    title: "Seller terverifikasi",
    description: "Produk dimoderasi admin sebelum masuk katalog.",
  },
];

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : "/");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,32rem)]">
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-surface-grid absolute inset-0 opacity-60" aria-hidden />
        <div
          className="absolute -left-24 top-1/3 size-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <Logo className="size-10" />
          <span className="text-base font-extrabold uppercase tracking-wider">ANGGA PART</span>
        </Link>

        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            ANGGA PART. Presisi, performa, dan kesempurnaan —
            dari login sampai kirim.
          </h2>
          <ul className="mt-8 grid max-w-md gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm text-primary-foreground/75">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} ANGGA PART · Demo, bukan toko sungguhan.
        </p>
      </aside>

      <div className="flex flex-col bg-background">
        <header className="flex h-16 items-center justify-between border-b border-border/70 px-4 sm:px-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="text-sm font-extrabold uppercase tracking-wider">ANGGA PART</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Kembali ke katalog
          </Link>
        </footer>
      </div>
    </div>
  );
}