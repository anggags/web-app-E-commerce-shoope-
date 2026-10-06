import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Truck } from "lucide-react";

import { Logo } from "@/components/brand/logo";

const FEATURES = [
  {
    icon: Truck,
    title: "Checkout multi-toko",
    description: "Satu keranjang, ongkir & resi per seller.",
  },
  {
    icon: ShieldCheck,
    title: "Seller terverifikasi",
    description: "Setiap produk dimoderasi admin.",
  },
  {
    icon: Flame,
    title: "Harga & rating transparan",
    description: "Ulasan asli, harga coret, produk terlaris.",
  },
];

export function HeroBanner() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0e] text-white shadow-pop">
      <div
        aria-hidden
        className="absolute inset-0 bg-[image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:36px_36px]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 size-[480px] -translate-x-1/2 -translate-y-3/4 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_62%)] blur-2xl animate-glow-pulse sm:size-[620px]" />
        <div className="absolute -left-28 -top-16 size-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-28 -right-24 size-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-14 pt-14 text-center sm:pb-20 sm:pt-20">
        <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 backdrop-blur">
          Official Store · Terverifikasi
        </span>

        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 blur-3xl animate-glow-pulse sm:size-72"
          />
          <div className="animate-fade-in relative flex size-28 items-center justify-center rounded-[1.75rem] bg-white p-3 shadow-[0_28px_70px_-18px_rgba(0,0,0,0.65)] ring-1 ring-white/40 sm:size-36 sm:rounded-[2.25rem] sm:p-4">
            <Logo variant="light" className="size-full" />
          </div>
        </div>

        <h1 className="animate-fade-in-up mt-9 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
          ANGGA&nbsp;PART<span className="text-white/50">.</span>
          <span className="block">
            Presisi<span className="text-white/50">.</span> Performa
            <span className="text-white/50">.</span>{" "}
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Kesempurnaan
            </span>
            <span className="text-primary">.</span>
          </span>
        </h1>

        <p className="animate-fade-in-delay-100 mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
          Komponen, aksesori, dan perlengkapan pilihan dengan standar presisi.
          Belanja dari banyak seller dalam satu keranjang — checkout sekali,
          tiap toko tetap mengirim dengan ongkir dan resi masing-masing.
        </p>

        <div className="animate-fade-in-delay-200 mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/search"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_0_32px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-[0.98]"
          >
            Beli Sekarang
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/search"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/40 hover:bg-white/10"
          >
            Jelajahi Katalog
          </Link>
        </div>

        <dl className="animate-fade-in-delay-400 mt-12 grid w-full max-w-2xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center gap-2 bg-[#0e0e12] px-5 py-6 text-center"
            >
              <feature.icon className="size-5 text-white/80" />
              <dt className="text-sm font-semibold">{feature.title}</dt>
              <dd className="text-xs leading-relaxed text-white/55">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}